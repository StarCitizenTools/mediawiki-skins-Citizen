<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Menu;

/**
 * Decorates menu-item arrays with Citizen's icon markup and Codex button
 * classes. Shared by the navigation pipeline and the sidebar hooks, which
 * decorate the same item shape from different MediaWiki entry points.
 *
 * @internal
 */
final class MenuItemDecorator {

	/**
	 * Set the icon parameter of the menu item based on the mapping
	 */
	public static function mapIconsToMenuItems( array &$links, string $menu, array $map ): void {
		foreach ( $map as $key => $icon ) {
			if ( isset( $links[$menu][$key] ) ) {
				$links[$menu][$key]['icon'] ??= $icon;
			}
		}
	}

	/**
	 * Add Codex button classes to menu items
	 */
	public static function addButtonClassesToMenuItems( array &$links, string $menu ): void {
		$buttonClasses = [
			'citizen-cdx-button--size-large',
			'cdx-button',
			'cdx-button--fake-button',
			'cdx-button--fake-button--enabled',
			'cdx-button--weight-quiet',
		];

		foreach ( $links[$menu] as &$item ) {
			if ( is_array( $item ) ) {
				self::appendClassToItem( $item['link-class'], $buttonClasses );
			}
		}
	}

	/**
	 * Add the HTML needed for icons to menu items
	 */
	public static function addIconsToMenuItems( array &$links, string $menu ): void {
		// Loop through each menu to check/append its link classes.
		foreach ( $links[$menu] as $key => $item ) {
			$icon = $item['icon'] ?? '';

			if ( $icon ) {
				$links[$menu][$key]['link-html'] = self::getIconHtml( $icon );
			}
		}
	}

	/**
	 * Get the HTML for an icon
	 */
	public static function getIconHtml( string $icon ): string {
		// Html::makeLink will pass this through rawElement
		// Avoid using mw-ui-icon in case its styles get loaded
		// Sometimes extension includes the "wikimedia-" part in the icon key (e.g. ULS),
		// so we apply both classes just to be safe
		return '<span class="citizen-ui-icon mw-ui-icon-' . $icon . ' mw-ui-icon-wikimedia-' . $icon . '"></span>';
	}

	/**
	 * Promote a menu item from quiet to progressive primary
	 */
	public static function setProgressiveAction( array|string|null &$linkClass ): void {
		if ( is_array( $linkClass ) ) {
			$linkClass = array_values( array_diff( $linkClass, [ 'cdx-button--weight-quiet' ] ) );
		} elseif ( is_string( $linkClass ) ) {
			$linkClass = trim( str_replace( 'cdx-button--weight-quiet', '', $linkClass ) );
		}
		self::appendClassToItem( $linkClass, [
			'cdx-button--weight-primary',
			'cdx-button--action-progressive',
		] );
	}

	/**
	 * Adds class to a property
	 * Based on Vector
	 */
	public static function appendClassToItem( array|string|null &$item, array|string $classes ): void {
		$existingClasses = $item;

		if ( is_array( $existingClasses ) ) {
			// Treat as array
			$newArrayClasses = is_array( $classes ) ? $classes : [ trim( $classes ) ];
			$item = array_merge( $existingClasses, $newArrayClasses );
		} elseif ( is_string( $existingClasses ) ) {
			// Treat as string
			$newStrClasses = is_string( $classes ) ? trim( $classes ) : implode( ' ', $classes );
			$item .= ' ' . $newStrClasses;
		} else {
			// Treat as whatever $classes is
			$item = $classes;
		}

		if ( is_string( $item ) ) {
			$item = trim( $item );
		}
	}
}
