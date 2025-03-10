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

namespace MediaWiki\Skins\Citizen\Partials;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXpath;
use HtmlFormatter\HtmlFormatter;
use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Services\NoSuchServiceException;

final class BodyContent extends Partial {

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
	 * @var array
	 */
	private $topHeadingTags = [ "h1", "h2", "h3", "h4", "h5", "h6" ];

	/**
	 * Helper function to decide if the page should be formatted
	 */
	private function shouldFormatPage( Title $title ): bool {
		$shouldFormat = (
			$this->getConfigValue( 'CitizenEnableCollapsibleSections' ) === true &&
			$title->canExist() &&
			!$title->isMainPage() &&
			$title->isContentPage() &&
			$title->getContentModel() === CONTENT_MODEL_WIKITEXT
		);

		if ( !$shouldFormat ) {
			return false;
		}

		// Check if page is in mobile view and let MF do the formatting
		try {
			$mfCxt = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
			return !$mfCxt->shouldDisplayMobileView();
		} catch ( NoSuchServiceException $ex ) {
			// MobileFrontend not installed. Don't do anything
		}

		return true;
	}

	/**
	 * Rebuild the body content
	 */
	public function decorateBodyContent( string $bodyContent ): string {
		$title = $this->title;

		// Return the page if title is null
		if ( $title === null ) {
			return $bodyContent;
		}

		// Make section and sanitize the output
		if ( $this->shouldFormatPage( $title ) ) {
			$formatter = new HtmlFormatter( $bodyContent );
			$doc = $formatter->getDoc();
			// Make top level sections
			$this->makeSections( $doc, $this->getTopHeadings( $doc ) );
			$formatter->filterContent();
			$bodyContent = $formatter->getText();
		}

		return $bodyContent;
	}

	private function getHeadingName( DOMNode|false $node ): string|false {
		if ( !( $node instanceof DOMElement ) ) {
			return false;
		}
		// We accept both kinds of nodes that can be returned by getTopHeadings():
		// a `<h1>` to `<h6>` node, or a `<div class="mw-heading">` node wrapping it.
		// In the future `<div class="mw-heading">` will be required (T13555).
		if ( DOMCompat::getClassList( $node )->contains( 'mw-heading' ) ) {
			$node = DOMCompat::querySelector( $node, implode( ',', $this->topHeadingTags ) );
			if ( !( $node instanceof DOMElement ) ) {
				return false;
			}
		}
		return $node->tagName;
	}

	/**
	 * Actually splits splits the body of the document into sections
	 *
	 * @param DOMDocument $doc representing the HTML of the body content. In the HTML the sections
	 *  should not be wrapped.
	 * @param DOMElement[] $headingWrappers The headings (or wrappers) returned by getTopHeadings():
	 *  `<h1>` to `<h6>` nodes, or `<div class="mw-heading">` nodes wrapping them.
	 *  In the future `<div class="mw-heading">` will be required (T13555).
	 */
	private function makeSections( DOMDocument $doc, array $headingWrappers ): DOMDocument {
		$xpath = new DOMXpath( $doc );
		$containers = $xpath->query(
			// Equivalent of CSS attribute `~=` to support multiple classes
			'//div[contains(concat(" ",normalize-space(@class)," ")," mw-parser-output ")][1]'
		);

		// Return if no parser output is found
		if ( !$containers->length || $containers->item( 0 ) === null ) {
			return $doc;
		}

		$container = $containers->item( 0 );

		$containerChild = $container->firstChild;
		$firstHeading = reset( $headingWrappers );
		$firstHeadingName = $this->getHeadingName( $firstHeading );
		$sectionNumber = 0;
		$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber );

		while ( $containerChild ) {
			$node = $containerChild;
			$containerChild = $containerChild->nextSibling;

			// If we've found a top level heading, insert the previous section if
			// necessary and clear the container div.
			if ( $firstHeadingName && $this->getHeadingName( $node ) === $firstHeadingName ) {
				$this->prepareHeading( $doc, $node );
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
	 */
	private function prepareHeading( DOMDocument $doc, DOMElement $heading ): void {
		$className = $heading->hasAttribute( 'class' ) ? $heading->getAttribute( 'class' ) . ' ' : '';
		$heading->setAttribute( 'class', $className . 'citizen-section-heading' );

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
		$sectionBody->setAttribute( 'class', self::SECTION_CLASS );
		$sectionBody->setAttribute( 'id', 'citizen-section-' . $sectionNumber );

		return $sectionBody;
	}

	/**
	 * Gets top headings in the document.
	 */
	private function getTopHeadings( DOMDocument $doc ): array {
		$headings = [];

		foreach ( $this->topHeadingTags as $tagName ) {
			$allTags = DOMCompat::querySelectorAll( $doc, $tagName );

			foreach ( $allTags as $el ) {
				$parent = $el->parentNode;
				if ( !( $parent instanceof DOMElement ) ) {
					continue;
				}

				$parentClasses = DOMCompat::getClassList( $parent );

				// Use the `<div class="mw-heading">` wrapper if it is present. When they are required
				// (T13555), the querySelectorAll() above can use the class and this can be removed.
				if ( $parentClasses->contains( 'mw-heading' ) ) {
					$el = $parent;
				} elseif ( !$parentClasses->contains( 'mw-parser-output' ) ) {
					// Only target page headings, but not other heading tags
					// TODO: Drop this when T13555 is deployed on LTS
					continue;
				}

				// This check can be removed too when we require the wrappers.
				if ( $parent->getAttribute( 'class' ) !== 'toctitle' ) {
					$headings[] = $el;
				}
			}
			if ( $headings ) {
				return $headings;
			}

		}

		return $headings;
	}
}
