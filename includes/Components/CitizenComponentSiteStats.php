<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Config\Config;
use MediaWiki\Language\Language;
use MediaWiki\Languages\LanguageNameUtils;
use MediaWiki\MainConfigNames;
use MediaWiki\SiteStats\SiteStats;
use Locale;
use MessageLocalizer;
use NumberFormatter;
use RuntimeException;
use ValueError;

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

	private ?NumberFormatter $fmt = null;

	public function __construct(
		private readonly Config $config,
		private readonly MessageLocalizer $localizer,
		private readonly Language $lang,
		private readonly LanguageNameUtils $langNameUtils
	) {
	}

	private function createNumberFormatter( string $locale ): ?NumberFormatter {
		try {
			return new NumberFormatter(
				$locale,
				// PHP 8.4 introduced NumberFormatter::DECIMAL_COMPACT_SHORT
				defined( 'NumberFormatter::DECIMAL_COMPACT_SHORT' )
					? NumberFormatter::DECIMAL_COMPACT_SHORT
					: 14
			);
		} catch ( ValueError $exception ) {
			// Value Errors are thrown since php8.4 for invalid locales (T376711)
			return null;
		}
	}

	private function getNumberFormatter(): NumberFormatter {
		if ( $this->fmt ) {
			return $this->fmt;
		}

		$locale = $this->lang->getCode();

		if ( !(
			$this->config->get( MainConfigNames::TranslateNumerals )
			&& $this->langNameUtils->isValidCode( $locale )
		) ) {
			$locale = Locale::getDefault(); // POSIX system default locale
		}

		$fmt = $this->createNumberFormatter( $locale );

		if ( !$fmt ) {
			$fallbacks = $this->lang->getFallbackLanguages( $locale );
			foreach ( $fallbacks as $fallbackCode ) {
				$fmt = $this->createNumberFormatter( $fallbackCode );
				if ( $fmt ) {
					break;
				}
			}
			if ( !$fmt ) {
				throw new RuntimeException(
					'Could not instance NumberFormatter for ' . $locale . ' and all fallbacks'
				);
			}
		}

		$fmt->setAttribute( NumberFormatter::ROUNDING_MODE, NumberFormatter::ROUND_DOWN );
		$fmt->setAttribute( NumberFormatter::MAX_FRACTION_DIGITS, 1 );

		$this->fmt = $fmt;

		return $this->fmt;
	}

	private function getSiteStatValue( string $key ): string {
		$value = SiteStats::$key();

		if ( !$value ) {
			return '';
		}

		return (string)$this->getNumberFormatter()->format( $value );
	}

	public function getTemplateData(): array {
		if ( !$this->config->get( 'CitizenEnableDrawerSiteStats' ) ) {
			return [];
		}

		$items = [];

		foreach ( self::SITESTATS_ICON_MAP as $key => $icon ) {
			$items[] = [
				'id' => $key,
				'icon' => $icon,
				'value' => $this->getSiteStatValue( $key ),
				'label' => $this->localizer->msg( "citizen-sitestats-$key-label" )->text(),
			];
		}

		return [
			'array-sitestats-items' => $items
		];
	}
}
