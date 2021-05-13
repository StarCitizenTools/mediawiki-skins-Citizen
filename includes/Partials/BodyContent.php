<?php
/**
 * Citizen - A responsive skin developed for the Star Citizen Wiki
 *
 * This file is part of Citizen.
 *
 * Citizen is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Citizen is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Citizen.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file
 * @ingroup Skins
 */

declare( strict_types=1 );

namespace Citizen\Partials;

use DOMDocument;
use DOMElement;
use DOMXpath;
use Html;
use HtmlFormatter\HtmlFormatter;
use OutputPage;

final class BodyContent extends Partial {

	/**
	 * The code below is largely based on the extension MobileFrontend
	 * All credits go to the author and contributors of the project
	 */

	/**
	 * Class name for collapsible section wrappers
	 */
	public const STYLE_COLLAPSIBLE_SECTION_CLASS = 'section-collapsible';

	/**
	 * List of tags that could be considered as section headers.
	 * @var array
	 */
	private $topHeadingTags = [ "h1", "h2", "h3", "h4", "h5", "h6 " ];

	/**
	 * Helper function to decide if the page should be collapsible
	 *
	 * @param Title $title
	 * @return string
	 */
	private function isCollapsiblePage( $title ) {
		return $this->getConfigValue( 'CitizenEnableCollapsibleSections' ) === true &&
			!$title->isMainPage() &&
			$title->isContentPage();
	}

	/**
	 * Rebuild the body content
	 *
	 * @param OutputPage $out OutputPage
	 * @return string html
	 */
	public function buildBodyContent( $out ) {
		$printSource = Html::rawElement( 'div', [ 'class' => 'printfooter' ], $this->skin->printSource() );
		$htmlBodyContent = $out->getHTML() . "\n" . $printSource;
		$title = $out->getTitle();

		// Return the page if title is null
		if ( $title === null ) {
			return $htmlBodyContent;
		}

		// Make section and sanitize the output
		if ( $this->isCollapsiblePage( $title ) ) {
			$formatter = new HtmlFormatter( $htmlBodyContent );
			$doc = $formatter->getDoc();
			// Make top level sections
			$this->makeSections( $doc, $this->getTopHeadings( $doc ) );
			// Mark subheadings
			$this->markSubHeadings( $this->getSubHeadings( $doc ) );

			$formatter->filterContent();
			$htmlBodyContent = $formatter->getText();
		}

		return $this->skin->wrapHTMLPublic( $title, $htmlBodyContent );
	}

	/**
	 * Actually splits splits the body of the document into sections
	 *
	 * @param DOMDocument $doc representing the HTML of the current article. In the HTML the sections
	 *  should not be wrapped.
	 * @param DOMElement[] $headings The headings returned by
	 * @return DOMDocument
	 */
	private function makeSections( DOMDocument $doc, array $headings ) {
		$xpath = new DOMXpath( $doc );
		$containers = $xpath->query( 'body/div[@class="mw-parser-output"][1]' );

		// Return if no parser output is found
		if ( !$containers->length || $containers->item( 0 ) === null ) {
			return $doc;
		}

		$container = $containers->item( 0 );

		$containerChild = $container->firstChild;
		$firstHeading = reset( $headings );
		$firstHeadingName = $firstHeading->nodeName ?? false;
		$sectionNumber = 0;
		$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber );

		while ( $containerChild ) {
			$node = $containerChild;
			$containerChild = $containerChild->nextSibling;

			// If we've found a top level heading, insert the previous section if
			// necessary and clear the container div.
			// Note well the use of DOMNode#nodeName here. Only DOMElement defines
			// DOMElement#tagName.  So, if there's trailing text - represented by
			// DOMText - then accessing #tagName will trigger an error.
			if ( $node->nodeName === $firstHeadingName ) {
				// The heading we are transforming is always 1 section ahead of the
				// section we are currently processing
				/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
				$this->prepareHeading( $doc, $node, $sectionNumber + 1 );
				// Insert the previous section body and reset it for the new section
				$container->insertBefore( $sectionBody, $node );

				++$sectionNumber;
				$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber );
				continue;
			}

			// If it is not a top level heading, keep appending the nodes to the
			// section body container.
			$sectionBody->appendChild( $node );
		}

		// Append the last section body.
		$container->appendChild( $sectionBody );

		return $doc;
	}

	/**
	 * Prepare section headings, add required classes
	 *
	 * @param DOMDocument $doc
	 * @param DOMElement $heading
	 * @param int $sectionNumber
	 */
	private function prepareHeading( DOMDocument $doc, DOMElement $heading, $sectionNumber ) {
		$className = $heading->hasAttribute( 'class' ) ? $heading->getAttribute( 'class' ) . ' ' : '';
		$heading->setAttribute( 'class', $className . 'section-heading' );

		// prepend indicator - this avoids a reflow by creating a placeholder for a toggling indicator
		$indicator = $doc->createElement( 'div' );
		$indicator->setAttribute( 'class', 'section-toggle' );
		$indicator->setAttribute( 'role', 'button' );
		$heading->insertBefore( $indicator, $heading->firstChild );
	}

	/**
	 * Creates a Section body element
	 *
	 * @param DOMDocument $doc
	 * @param int $sectionNumber
	 *
	 * @return DOMElement
	 */
	private function createSectionBodyElement( DOMDocument $doc, $sectionNumber ) {
		$sectionBody = $doc->createElement( 'section' );
		$sectionBody->setAttribute( 'class', self::STYLE_COLLAPSIBLE_SECTION_CLASS );
		$sectionBody->setAttribute( 'id', 'section-collapsible-' . $sectionNumber );

		return $sectionBody;
	}

	/**
	 * Gets top headings in the document.
	 *
	 * @param DOMDocument $doc
	 * @return array An array first is the highest rank headings
	 */
	private function getTopHeadings( DOMDocument $doc ): array {
		$headings = [];

		foreach ( $this->topHeadingTags as $tagName ) {
			$allTags = $doc->getElementsByTagName( $tagName );

			foreach ( $allTags as $el ) {
				if ( $el->parentNode->getAttribute( 'class' ) !== 'toctitle' ) {
					$headings[] = $el;
				}
			}
			if ( $headings ) {
				return $headings;
			}

		}

		return $headings;
	}

	/**
	 * Marks the subheadings for the approiate styles by adding
	 * the <code>section-subheading</code> class to each of them, if it
	 * hasn't already been added.
	 *
	 * @param DOMElement[] $headings Heading elements
	 */
	protected function markSubHeadings( array $headings ) {
		foreach ( $headings as $heading ) {
			$class = $heading->getAttribute( 'class' );
			if ( strpos( $class, 'section-subheading' ) === false ) {
				$heading->setAttribute(
					'class',
					ltrim( $class . ' section-subheading' )
				);
			}
		}
	}

	/**
	 * Gets all subheadings in the document in rank order.
	 *
	 * @param DOMDocument $doc
	 * @return DOMElement[]
	 */
	private function getSubHeadings( DOMDocument $doc ): array {
		$found = false;
		$subheadings = [];
		foreach ( $this->topHeadingTags as $tagName ) {
			$allTags = $doc->getElementsByTagName( $tagName );
			$elements = [];
			foreach ( $allTags as $el ) {
				if ( $el->parentNode->getAttribute( 'class' ) !== 'toctitle' ) {
					$elements[] = $el;
				}
			}

			if ( $elements ) {
				if ( !$found ) {
					$found = true;
				} else {
					$subheadings = array_merge( $subheadings, $elements );
				}
			}
		}

		return $subheadings;
	}
}
