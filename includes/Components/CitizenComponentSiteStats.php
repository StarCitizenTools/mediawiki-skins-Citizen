<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use IntlException;
use MediaWiki\Config\Config;
use MediaWiki\Language\Language;
use MediaWiki\SiteStats\SiteStats;
use MediaWiki\StubObject\StubUserLang;
use MessageLocalizer;
use NumberFormatter;

/**
 * CitizenComponentSiteStats component
 * FIXME: Need unit test
 */
class CitizenComponentSiteStats implements CitizenComponent {

	private const SITESTATS_ICON_MAP = [
		'articles' => 'article',
		'images' => 'image',
		'users' => 'userAvatar',
		'edits' => 'edit'
	];

	public function __construct(
		private Config $config,
		private MessageLocalizer $localizer,
		private Language|StubUserLang $pageLang
	) {
	}

	/**
	 * Get and format sitestat value
	 */
	private function getSiteStatValue( string $key, ?NumberFormatter $fmt ): string {
		$value = SiteStats::$key();

		if ( !$value ) {
			return '';
		}

		return $fmt ? $fmt->format( $value ) : number_format( $value );
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$config = $this->config;
		if ( !$config->get( 'CitizenEnableDrawerSiteStats' ) ) {
			return [];
		}

		$items = [];
		$fmt = null;

		// Get NumberFormatter here so that we don't have to call it for every stats
		if ( $config->get( 'CitizenUseNumberFormatter' ) && class_exists( NumberFormatter::class ) ) {
			$locale = $this->pageLang->getHtmlCode() ?? 'en_US';
			try {
				$fmt = new NumberFormatter( $locale, NumberFormatter::PADDING_POSITION );
				$fmt->setAttribute( NumberFormatter::ROUNDING_MODE, NumberFormatter::ROUND_DOWN );
				$fmt->setAttribute( NumberFormatter::MAX_FRACTION_DIGITS, 1 );
			} catch ( IntlException $exception ) {
				/*
				 * FIXME: Put a proper log or error message here?
				 * For some unknown reason, NumberFormatter can throw an IntlException: Constructor failed
				 * This should allow Citizen to run as usual even if such exception is encountered.
				 */
			}
		}

		foreach ( self::SITESTATS_ICON_MAP as $key => $icon ) {
			$items[] = [
				'id' => $key,
				'icon' => $icon,
				'value' => $this->getSiteStatValue( $key, $fmt ),
				'label' => $this->localizer->msg( "citizen-sitestats-$key-label" )->text(),
			];
		}

		return [
			'array-sitestats-items' => $items
		];
	}
}
