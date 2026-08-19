<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\DOM\Node;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * CitizenComponentBodyContent component
 */
class CitizenComponentBodyContent implements CitizenComponent {

	/**
	 * The code below is largely based on the extension MobileFrontend
	 * All credits go to the author and contributors of the project
	 *
	 * Core also has ParserOptions::setCollapsibleSections() (1.42+), which
	 * wraps legacy-parser section contents in plain divs at parse time.
	 * Nothing sets it by default and its wrappers carry no class to target,
	 * so this transform stays; revisit if core ever enables it.
	 */

	/**
	 * Class name for section wrappers
	 */
	public const SECTION_CLASS = 'citizen-section';

	/**
	 * Class name for the element holding everything after a section's heading.
	 * Collapsing hides this rather than each content child, so that the box
	 * carrying `hidden` is one the skin owns rather than arbitrary wiki markup.
	 *
	 * It must stay a bare block box. Padding, borders and backgrounds paint
	 * through a collapse; `overflow`, `contain`, `display` and `position` can
	 * trap the section's floats; and blocking the margin that collapses out of
	 * it detaches a leading float from the text it sits beside.
	 */
	public const SECTION_BODY_CLASS = 'citizen-section-body';

	/**
	 * Class marking a section's heading. Kept in step with the frontend's own
	 * heading selector, which also accepts core's `mw-heading`.
	 */
	public const SECTION_HEADING_CLASS = 'citizen-section-heading';

	/**
	 * Sentinel nesting level for the lead section: no heading level nests
	 * beneath it, matching Parsoid's lead section semantics.
	 */
	private const LEAD_SECTION_LEVEL = 7;

	/**
	 * List of tags that could be considered as section headers.
	 */
	private array $topHeadingTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

	public function __construct(
		private readonly string $html,
		private readonly bool $shouldMakeSections
	) {
	}

	/**
	 * Wraps the body of the document into nested sections in a single pass.
	 *
	 * The output mirrors the shape Parsoid produces natively: each heading
	 * starts a <section> that contains the heading and everything up to the
	 * next heading of equal or higher rank; lower-ranked headings nest their
	 * sections inside the current one. Content before the first heading goes
	 * into a headingless lead section, which needs no body wrapper because
	 * nothing can collapse it.
	 */
	private function makeSections( Document $doc ): Document {
		$container = DOMCompat::querySelector( $doc, 'div.mw-parser-output' );

		if ( $container === null ) {
			return $doc;
		}

		$sectionNumber = 0;
		$currentLevel = self::LEAD_SECTION_LEVEL;
		$leadSection = $this->createSection( $doc, $sectionNumber );
		$container->insertBefore( $leadSection, $container->firstChild );
		$currentBody = $leadSection;

		/** @var array<array{0: int, 1: Element}> Bodies of the open ancestor sections */
		$stack = [];

		// The lead section is the container's first child now; walk what follows it
		$currentNode = $leadSection->nextSibling;
		while ( $currentNode ) {
			$nextNode = $currentNode->nextSibling;

			// @phan-suppress-next-line PhanTypeMismatchArgument DOMNode is a Parsoid DOM\Node alias
			$level = $this->getSectionHeadingLevel( $currentNode );
			if ( $level === null ) {
				$currentBody->appendChild( $currentNode );
			} else {
				// Pop ancestors that cannot contain a section of this rank
				while ( $stack && end( $stack )[0] >= $level ) {
					array_pop( $stack );
				}
				if ( $currentLevel < $level ) {
					$stack[] = [ $currentLevel, $currentBody ];
				}

				$sectionNumber++;
				$newSection = $this->createSection( $doc, $sectionNumber );
				// Subsections are content, so they collapse with the parent.
				$parentBody = $stack ? end( $stack )[1] : null;
				if ( $parentBody ) {
					$parentBody->appendChild( $newSection );
				} else {
					$container->insertBefore( $newSection, $currentNode );
				}

				$newSection->appendChild( $currentNode );
				if ( $currentNode instanceof Element ) {
					$this->prepareHeading( $currentNode );
				}

				$currentBody = $this->createSectionBody( $doc );
				$newSection->appendChild( $currentBody );

				$currentLevel = $level;
			}

			$currentNode = $nextNode;
		}

		return $doc;
	}

	/**
	 * Give every native Parsoid section the body wrapper the legacy transform
	 * builds, so both parsers collapse through the same element.
	 *
	 * A section only gets one when the frontend can collapse it, which needs a
	 * heading it recognises. The lead section has none, and core leaves
	 * HTML-syntax headings unwrapped (T353489), so both are left alone.
	 */
	private function wrapSectionBodies( Document $doc ): void {
		foreach ( DOMCompat::querySelectorAll( $doc, 'section[data-mw-section-id]' ) as $section ) {
			$heading = $this->getFirstElementChild( $section );
			if ( $heading === null || !$this->isSectionHeading( $heading ) ) {
				continue;
			}

			// A wrapper from another pipeline is wrapped in turn rather than
			// adopted, so the collapse target is always skin-owned.
			$existing = DOMCompat::getNextElementSibling( $heading );
			if ( $existing !== null
				&& DOMCompat::getClassList( $existing )->contains( self::SECTION_BODY_CLASS )
			) {
				continue;
			}

			$body = $this->createSectionBody( $doc );
			while ( $heading->nextSibling !== null ) {
				$body->appendChild( $heading->nextSibling );
			}
			$section->appendChild( $body );
		}
	}

	/**
	 * Whether the frontend will treat this element as a section heading.
	 */
	private function isSectionHeading( Element $element ): bool {
		$classes = DOMCompat::getClassList( $element );
		return $classes->contains( 'mw-heading' )
			|| $classes->contains( self::SECTION_HEADING_CLASS );
	}

	/**
	 * DOMCompat has getLastElementChild but no first-child equivalent.
	 */
	private function getFirstElementChild( Element $element ): ?Element {
		$node = $element->firstChild;
		while ( $node !== null && !( $node instanceof Element ) ) {
			$node = $node->nextSibling;
		}
		return $node;
	}

	/**
	 * The heading rank (1-6) when the node starts a section, or null when it
	 * is ordinary content.
	 */
	private function getSectionHeadingLevel( Node $node ): ?int {
		if ( !( $node instanceof Element ) ) {
			return null;
		}

		// We accept both kinds of nodes: a `<h1>` to `<h6>` node, or a
		// `<div class="mw-heading">` node wrapping it. In the future, the wrapper
		// will be required (T13555).
		$headingNode = $node;
		if ( DOMCompat::getClassList( $node )->contains( 'mw-heading' ) ) {
			$headingNode = DOMCompat::querySelector( $node, implode( ',', $this->topHeadingTags ) );
			if ( !( $headingNode instanceof Element ) ) {
				return null;
			}
		}

		// Normalize the tag name to lowercase
		// Since tagName seems to return uppercase in MW 1.44+ with PHP 8.4+
		$tagName = strtolower( $headingNode->tagName );
		if ( !in_array( $tagName, $this->topHeadingTags ) ) {
			return null;
		}

		return (int)$tagName[1];
	}

	/**
	 * Prepare section headings, add required classes.
	 * The collapse indicator renders purely through CSS on the heading's
	 * ::before, the same way native Parsoid sections are styled.
	 */
	private function prepareHeading( Element $heading ): void {
		DOMCompat::getClassList( $heading )->add( self::SECTION_HEADING_CLASS );
	}

	/**
	 * Creates a section element, which holds a heading and a body
	 */
	private function createSection( Document $doc, int $sectionNumber ): Element {
		$section = $doc->createElement( 'section' );
		$section->setAttribute( 'id', 'citizen-section-' . $sectionNumber );
		$section->setAttribute( 'class', self::SECTION_CLASS );

		// @phan-suppress-next-line PhanTypeMismatchReturnSuperType DOMElement is a Parsoid DOM\Element alias
		return $section;
	}

	/**
	 * Creates the element holding everything after a section's heading
	 */
	private function createSectionBody( Document $doc ): Element {
		$body = $doc->createElement( 'div' );
		$body->setAttribute( 'class', self::SECTION_BODY_CLASS );

		// @phan-suppress-next-line PhanTypeMismatchReturnSuperType DOMElement is a Parsoid DOM\Element alias
		return $body;
	}

	/**
	 * Whether the HTML was rendered by Parsoid, which wraps sections natively
	 * in `<section data-mw-section-id>` elements. The tag-open form cannot
	 * occur in user content: the sanitizer strips data-mw-* attributes from
	 * wikitext, and escaped markup in code samples never contains a raw `<`.
	 */
	private function isParsoidContent( string $html ): bool {
		return str_contains( $html, '<section data-mw-section-id=' );
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$html = $this->html;

		if ( !$this->shouldMakeSections ) {
			return [ 'html-body-content' => $html ];
		}

		$doc = DOMUtils::parseHTML( $html );

		// Parsoid already ships the section wrappers, so it only needs the
		// bodies adding. The heading walk expects headings as direct children
		// of the parser output and would fold such a page into one section.
		if ( $this->isParsoidContent( $html ) ) {
			$this->wrapSectionBodies( $doc );
		} else {
			$this->makeSections( $doc );
		}

		return [
			'html-body-content' => DOMCompat::getInnerHTML( DOMCompat::getBody( $doc ) ),
		];
	}
}
