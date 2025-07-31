<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXpath;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * CitizenComponentBodyContent component
 */
class CitizenComponentBodyContent implements CitizenComponent {

	/**
	 * The code below is largely based on the extension MobileFrontend
	 * All credits go to the author and contributors of the project
	 */

	/**
	 * Class name for section wrappers
	 */
	public const SECTION_CLASS = 'citizen-section';

	/**
	 * List of tags that could be considered as section headers.
	 */
	private array $topHeadingTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

	/**
	 * The tag name of the top-level heading elements used for section breaks.
	 * This is determined on the fly when processing the content.
	 */
	private ?string $topHeadingName = null;

	public function __construct(
		private string $html,
		private bool $shouldMakeSections
	) {
	}

	/**
	 * Splits the body of the document into sections in a single pass.
	 */
	private function makeSections( DOMDocument $doc ): DOMDocument {
		$xpath = new DOMXpath( $doc );
		$containers = $xpath->query(
			'//div[contains(concat(" ",normalize-space(@class)," ")," mw-parser-output ")][1]'
		);

		if ( $containers->length === 0 ) {
			return $doc;
		}

		$container = $containers->item( 0 );
		if ( !( $container instanceof DOMElement ) ) {
			return $doc;
		}

		// Reset state for this run
		$this->topHeadingName = null;

		$sectionNumber = 0;
		$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber );

		$currentNode = $container->firstChild;
		while ( $currentNode ) {
			$nextNode = $currentNode->nextSibling;

			if ( !$this->isSectionBreak( $currentNode ) ) {
				$sectionBody->appendChild( $currentNode );
			} else {
				$container->insertBefore( $sectionBody, $currentNode );

				$this->prepareHeading( $doc, $currentNode );

				$sectionNumber++;
				$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber );
			}

			$currentNode = $nextNode;
		}

		// Append the final section body, which contains all nodes after the last heading.
		$container->appendChild( $sectionBody );

		return $doc;
	}

	/**
	 * Determines if a given node should be treated as a section break.
	 * This method has the side effect of setting the `$topHeadingName`
	 * property when the first valid section heading is found.
	 */
	private function isSectionBreak( DOMNode $node ): bool {
		if ( !$node instanceof DOMElement ) {
			return false;
		}

		$currentHeadingName = $this->getHeadingName( $node );
		if ( !$currentHeadingName ) {
			return false;
		}

		if ( $this->topHeadingName === null ) {
			// This is the first potential heading. If it's valid, make it the standard.
			if ( $this->isValidSectionHeading( $node ) ) {
				$this->topHeadingName = $currentHeadingName;
				return true;
			}
			return false;
		} else {
			// This is a subsequent heading. Check if it matches the top-level one.
			return $currentHeadingName === $this->topHeadingName;
		}
	}

	private function getHeadingName( DOMNode $node ): ?string {
		if ( !( $node instanceof DOMElement ) ) {
			return null;
		}

		// We accept both kinds of nodes: a `<h1>` to `<h6>` node, or a
		// `<div class="mw-heading">` node wrapping it. In the future, the wrapper
		// will be required (T13555).
		if ( DOMCompat::getClassList( $node )->contains( 'mw-heading' ) ) {
			$headingNode = DOMCompat::querySelector( $node, implode( ',', $this->topHeadingTags ) );
			if ( $headingNode instanceof DOMElement ) {
				$tagName = $headingNode->tagName;
				return in_array( $tagName, $this->topHeadingTags ) ? $tagName : null;
			}
			return null;
		}

		$tagName = $node->tagName;
		return in_array( $tagName, $this->topHeadingTags ) ? $tagName : null;
	}

	/**
	 * Checks if a node is a valid heading for creating a section.
	 * This is used to filter out headings that shouldn't create sections,
	 * e.g., headings inside the Table of Contents.
	 */
	private function isValidSectionHeading( DOMElement $element ): bool {
		// A heading element can be the element itself (h1-h6) or a wrapper div.
		$headingElement = $element;
		if ( !in_array( $element->tagName, $this->topHeadingTags ) ) {
			// If the element is not a heading tag, it might be a wrapper.
			$found = DOMCompat::querySelector( $element, implode( ',', $this->topHeadingTags ) );
			if ( !$found ) {
				// Not a valid heading wrapper.
				return false;
			}
		}

		$parent = $headingElement->parentNode;
		if ( !( $parent instanceof DOMElement ) ) {
			// Should not happen in a valid document.
			return false;
		}

		$classList = DOMCompat::getClassList( $parent );
		// Ignore headings inside the Table of Contents.
		return !$classList->contains( 'toctitle' );
	}

	/**
	 * Prepare section headings, add required classes
	 */
	private function prepareHeading( DOMDocument $doc, DOMElement $heading ): void {
		DOMCompat::getClassList( $heading )->add( 'citizen-section-heading' );

		// prepend indicator - this avoids a reflow by creating a placeholder for a toggling indicator
		$indicator = $doc->createElement( 'span' );
		$indicator->setAttribute( 'class', 'citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse' );
		$heading->insertBefore( $indicator, $heading->firstChild );
	}

	/**
	 * Creates a Section body element
	 */
	private function createSectionBodyElement( DOMDocument $doc, int $sectionNumber ): DOMElement {
		$sectionBody = $doc->createElement( 'section' );
		$sectionBody->setAttribute( 'id', 'citizen-section-' . $sectionNumber );
		$sectionBody->setAttribute( 'class', self::SECTION_CLASS );

		return $sectionBody;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$html = $this->html;

		if ( $this->shouldMakeSections ) {
			$doc = DOMUtils::parseHTML( $html );
			$this->makeSections( $doc );
			$html = DOMCompat::getInnerHTML( DOMCompat::getBody( $doc ) );
		}

		return [
			'html-body-content' => $html,
		];
	}
}
