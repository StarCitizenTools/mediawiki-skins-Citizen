<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Config;
use IntlException;
use Language;
use MediaWiki\StubObject\StubUserLang;
use MessageLocalizer;
use NumberFormatter;
use SiteStats;

/**
 * CitizenComponentSiteStats component
 * FIXME: Need unit test
 */
class CitizenComponentSiteStats implements CitizenComponent {
	/** @var Config */
	private $config;

	/** @var MessageLocalizer */
	private $localizer;

	/** @var Language|StubUserLang */
	private $pageLang;

	private const SITESTATS_ICON_MAP = [
		'articles' => 'article',
		'images' => 'image',
		'users' => 'userAvatar',
		'edits' => 'edit'
	];

	/**
	 * @return Config
	 */
	private function getConfig(): Config {
		return $this->config;
	}

	/**
	 * @param MessageLocalizer $localizer
	 * @param Language|StubUserLang $pageLang
	 */
	public function __construct(
		Config $config,
		MessageLocalizer $localizer,
		$pageLang
	) {
		$this->config = $config;
		$this->localizer = $localizer;
		$this->pageLang = $pageLang;
	}

	/**
	 * Get and format sitestat value
	 *
	 * @param string $key
	 * @param NumberFormatter|null $fmt
	 * @return string
	 */
	private function getSiteStatValue( $key, $fmt ): string {
		$value = SiteStats::$key() ?? '';

		if ( $fmt ) {
			return $fmt->format( $value );
		} else {
			return number_format( $value );
		}
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$config = $this->getConfig();
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
