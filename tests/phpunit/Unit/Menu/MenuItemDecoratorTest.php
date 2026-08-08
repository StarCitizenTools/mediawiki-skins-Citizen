<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Menu;

use MediaWiki\Skins\Citizen\Menu\MenuItemDecorator;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\Menu\MenuItemDecorator
 */
class MenuItemDecoratorTest extends MediaWikiUnitTestCase {

	public function testGetIconHtmlEmitsBothIconClassSpellings(): void {
		$html = MenuItemDecorator::getIconHtml( 'edit' );

		// Pinned literally rather than assembled from the icon key: this markup
		// lands in parser-cached HTML, so changing it is a cache-breaking change.
		// Extensions such as ULS pass the key with the "wikimedia-" part already
		// included, which is why both spellings are emitted.
		$this->assertSame(
			'<span class="citizen-ui-icon mw-ui-icon-edit mw-ui-icon-wikimedia-edit"></span>',
			$html
		);
	}

	public function testAddIconsToMenuItemsSetsLinkHtmlOnlyForItemsWithAnIcon(): void {
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'icon' => 'edit' ],
				'history' => [ 'id' => 'ca-history' ],
			],
		];

		MenuItemDecorator::addIconsToMenuItems( $links, 'views' );

		$this->assertSame(
			'<span class="citizen-ui-icon mw-ui-icon-edit mw-ui-icon-wikimedia-edit"></span>',
			$links['views']['edit']['link-html']
		);
		$this->assertArrayNotHasKey( 'link-html', $links['views']['history'] );
	}

	public function testAddIconsToMenuItemsIgnoresAnEmptyIcon(): void {
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'icon' => '' ],
			],
		];

		MenuItemDecorator::addIconsToMenuItems( $links, 'views' );

		$this->assertArrayNotHasKey( 'link-html', $links['views']['edit'] );
	}

	public function testAppendClassToItemMergesIntoAnArrayTarget(): void {
		$item = [ 'cdx-button', 'cdx-button--weight-quiet' ];

		MenuItemDecorator::appendClassToItem( $item, [ 'citizen-ve-edit-merged' ] );

		$this->assertSame(
			[ 'cdx-button', 'cdx-button--weight-quiet', 'citizen-ve-edit-merged' ],
			$item
		);
	}

	public function testAppendClassToItemWrapsAStringClassForAnArrayTarget(): void {
		$item = [ 'cdx-button' ];

		// The target's type wins: a string of classes joins an array target as a
		// single trimmed element rather than being split on whitespace.
		MenuItemDecorator::appendClassToItem( $item, '  citizen-ve-edit-merged  ' );

		$this->assertSame( [ 'cdx-button', 'citizen-ve-edit-merged' ], $item );
	}

	public function testAppendClassToItemConcatenatesOntoAStringTarget(): void {
		$item = 'cdx-button';

		MenuItemDecorator::appendClassToItem( $item, [ 'citizen-ve-edit-merged', 'extra' ] );

		$this->assertSame( 'cdx-button citizen-ve-edit-merged extra', $item );
	}

	public function testAppendClassToItemDoesNotLeadWithASpaceOnAnEmptyStringTarget(): void {
		// MediaWiki hands menu items an empty 'class' far more often than a
		// populated one, so the leading separator would otherwise ship on most
		// items.
		$item = '';

		MenuItemDecorator::appendClassToItem( $item, [ 'citizen-ve-edit-merged' ] );

		$this->assertSame( 'citizen-ve-edit-merged', $item );
	}

	public function testAppendClassToItemAdoptsTheClassesWholesaleWhenTargetIsNull(): void {
		$item = null;

		// With nothing to merge into, the item becomes whatever was passed —
		// including its type, so an array of classes yields an array.
		MenuItemDecorator::appendClassToItem( $item, [ 'cdx-button', 'citizen-ve-edit-merged' ] );

		$this->assertSame( [ 'cdx-button', 'citizen-ve-edit-merged' ], $item );
	}

	public function testAppendClassToItemTrimsAStringAdoptedByANullTarget(): void {
		$item = null;

		MenuItemDecorator::appendClassToItem( $item, '  cdx-button  ' );

		$this->assertSame( 'cdx-button', $item );
	}

	public function testSetProgressiveActionSwapsQuietForProgressiveInAnArray(): void {
		// The shape addButtonClassesToMenuItems leaves behind, which is what the
		// edit buttons are promoted from.
		$linkClass = [
			'citizen-cdx-button--size-large',
			'cdx-button',
			'cdx-button--fake-button',
			'cdx-button--fake-button--enabled',
			'cdx-button--weight-quiet',
		];

		MenuItemDecorator::setProgressiveAction( $linkClass );

		$this->assertSame(
			[
				'citizen-cdx-button--size-large',
				'cdx-button',
				'cdx-button--fake-button',
				'cdx-button--fake-button--enabled',
				'cdx-button--weight-primary',
				'cdx-button--action-progressive',
			],
			$linkClass
		);
	}

	public function testSetProgressiveActionRemovesQuietFromTheMiddleOfAnArray(): void {
		// Removal is by value, so the array branch leaves a gap mid-list.
		// appendClassToItem's array_merge closes it; the array_values() call
		// ahead of that is belt-and-braces.
		$linkClass = [ 'cdx-button', 'cdx-button--weight-quiet', 'cdx-button--fake-button' ];

		MenuItemDecorator::setProgressiveAction( $linkClass );

		$this->assertSame(
			[
				'cdx-button',
				'cdx-button--fake-button',
				'cdx-button--weight-primary',
				'cdx-button--action-progressive',
			],
			$linkClass
		);
	}

	public function testSetProgressiveActionSwapsQuietForProgressiveInAString(): void {
		// Extensions may hand back 'link-class' as a string, which never reaches
		// the array branch above.
		$linkClass = 'cdx-button cdx-button--weight-quiet';

		MenuItemDecorator::setProgressiveAction( $linkClass );

		$this->assertSame(
			'cdx-button cdx-button--weight-primary cdx-button--action-progressive',
			$linkClass
		);
	}

	public function testSetProgressiveActionRemovesQuietFromTheMiddleOfAString(): void {
		$linkClass = 'cdx-button cdx-button--weight-quiet cdx-button--fake-button';

		MenuItemDecorator::setProgressiveAction( $linkClass );

		// The string branch removes the substring, so the separators that sat
		// either side of it both survive as the doubled space below. Harmless in
		// a class attribute, which is a whitespace-separated token list.
		$this->assertSame(
			'cdx-button  cdx-button--fake-button cdx-button--weight-primary cdx-button--action-progressive',
			$linkClass
		);
	}

	public function testSetProgressiveActionStillPromotesAnItemWithNoExistingClasses(): void {
		$linkClass = null;

		MenuItemDecorator::setProgressiveAction( $linkClass );

		$this->assertSame(
			[ 'cdx-button--weight-primary', 'cdx-button--action-progressive' ],
			$linkClass
		);
	}
}
