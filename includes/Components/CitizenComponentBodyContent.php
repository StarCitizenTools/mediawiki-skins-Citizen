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
	 * into a headingless lead section.
	 */
	private function makeSections( Document $doc ): Document {
		$container = DOMCompat::querySelector( $doc, 'div.mw-parser-output' );

		if ( $container === null ) {
			return $doc;
		}

		$sectionNumber = 0;
		$currentLevel = self::LEAD_SECTION_LEVEL;
		$currentSection = $this->createSectionBodyElement( $doc, $sectionNumber );
		$container->insertBefore( $currentSection, $container->firstChild );

		/** @var array<array{0: int, 1: Element}> Open ancestor sections */
		$stack = [];

		// The lead section is the container's first child now; walk what follows it
		$currentNode = $currentSection->nextSibling;
		while ( $currentNode ) {
			$nextNode = $currentNode->nextSibling;

			// @phan-suppress-next-line PhanTypeMismatchArgument DOMNode is a Parsoid DOM\Node alias
			$level = $this->getSectionHeadingLevel( $currentNode );
			if ( $level === null ) {
				$currentSection->appendChild( $currentNode );
			} else {
				// Pop ancestors that cannot contain a section of this rank
				while ( $stack && end( $stack )[0] >= $level ) {
					array_pop( $stack );
				}
				if ( $currentLevel < $level ) {
					$stack[] = [ $currentLevel, $currentSection ];
				}

				$sectionNumber++;
				$newSection = $this->createSectionBodyElement( $doc, $sectionNumber );
				$parent = $stack ? end( $stack )[1] : null;
				if ( $parent ) {
					$parent->appendChild( $newSection );
				} else {
					$container->insertBefore( $newSection, $currentNode );
				}

				$newSection->appendChild( $currentNode );
				if ( $currentNode instanceof Element ) {
					$this->prepareHeading( $currentNode );
				}

				$currentLevel = $level;
				$currentSection = $newSection;
			}

			$currentNode = $nextNode;
		}

		return $doc;
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

		if ( !$this->isValidSectionHeading( $node ) ) {
			return null;
		}

		return (int)$tagName[1];
	}

	/**
	 * Checks if a node is a valid heading for creating a section.
	 * This is used to filter out headings that shouldn't create sections,
	 * e.g., headings inside the Table of Contents.
	 */
	private function isValidSectionHeading( Element $element ): bool {
		// A heading element can be the element itself (h1-h6) or a wrapper div.
		$headingElement = $element;
		if ( !in_array( strtolower( $element->tagName ), $this->topHeadingTags ) ) {
			// If the element is not a heading tag, it might be a wrapper.
			$found = DOMCompat::querySelector( $element, implode( ',', $this->topHeadingTags ) );
			if ( !$found ) {
				// Not a valid heading wrapper.
				return false;
			}
		}

		$parent = $headingElement->parentNode;
		if ( !( $parent instanceof Element ) ) {
			// Should not happen in a valid document.
			return false;
		}

		$classList = DOMCompat::getClassList( $parent );
		// Ignore headings inside the Table of Contents.
		return !$classList->contains( 'toctitle' );
	}

	/**
	 * Prepare section headings, add required classes.
	 * The collapse indicator renders purely through CSS on the heading's
	 * ::before, the same way native Parsoid sections are styled.
	 */
	private function prepareHeading( Element $heading ): void {
		DOMCompat::getClassList( $heading )->add( 'citizen-section-heading' );
	}

	/**
	 * Creates a Section body element
	 */
	private function createSectionBodyElement( Document $doc, int $sectionNumber ): Element {
		$sectionBody = $doc->createElement( 'section' );
		$sectionBody->setAttribute( 'id', 'citizen-section-' . $sectionNumber );
		$sectionBody->setAttribute( 'class', self::SECTION_CLASS );

		// @phan-suppress-next-line PhanTypeMismatchReturnSuperType DOMElement is a Parsoid DOM\Element alias
		return $sectionBody;
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

		// Parsoid content already ships section wrappers; the heading walk
		// below expects headings as direct children of the parser output and
		// would fold the whole page into a single section.
		if ( $this->shouldMakeSections && !$this->isParsoidContent( $html ) ) {
			$doc = DOMUtils::parseHTML( $html );
			$this->makeSections( $doc );
			$html = DOMCompat::getInnerHTML( DOMCompat::getBody( $doc ) );
		}

		return [
			'html-body-content' => $html,
		];
	}
}
