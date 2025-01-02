<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Exception;
use MediaWiki\Config\Config;
use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;
use MediaWiki\User\UserIdentity;
use MessageLocalizer;

/**
 * CitizenComponentPageTools component
 * FIXME: Need unit test
 */
class CitizenComponentPageTools implements CitizenComponent {
	/** @var Config */
	private $config;

	/** @var MessageLocalizer */
	private $localizer;

	/** @var Title */
	private $title;

	/** @var UserIdentity */
	private $user;

	/** @var int */
	private $numLanguages;

	/** @var array */
	private $sidebarData;

	/** @var array */
	private $languagesData;

	/** @var array */
	private $variantsData;

	/**
	 * @param Config $config
	 * @param MessageLocalizer $localizer
	 * @param Title $title
	 * @param UserIdentity $user
	 * @param int $numLanguages
	 * @param array $sidebarData
	 * @param array $languagesData
	 * @param array $variantsData
	 */
	public function __construct(
		Config $config,
		MessageLocalizer $localizer,
		Title $title,
		UserIdentity $user,
		int $numLanguages,
		array $sidebarData,
		array $languagesData,
		array $variantsData
	) {
		$this->config = $config;
		$this->localizer = $localizer;
		$this->title = $title;
		$this->user = $user;
		$this->numLanguages = $numLanguages;
		$this->sidebarData = $sidebarData;
		$this->languagesData = $languagesData;
		$this->variantsData = $variantsData;
	}

	/**
	 * Extract article tools from sidebar and return the data
	 *
	 * The reason we do this is because:
	 * 1. We removed some site-wide tools from the toolbar in Drawer.php,
	 * 	  now we just want the leftovers
	 * 2. Toolbox is not currently avaliable as data-portlet, have to wait
	 *    till Desktop Improvements
	 *
	 * @return array
	 */
	private function getArticleToolsData(): array {
		$data = [
			'is-empty' => true,
		];

		foreach ( $this->sidebarData['array-portlets-rest'] as $portlet ) {
			if ( $portlet['id'] === 'p-tb' ) {
				$data = $portlet;
				$data['is-empty'] = false;
				break;
			}
		}

		return $data;
	}

	/**
	 * Check if views and actions should show
	 *
	 * Possible visibility conditions:
	 * * true: always visible (bool)
	 * * false: never visible (bool)
	 * * 'login': only visible if logged in (string)
	 * * 'permission-*': only visible if user has permission
	 *   e.g. permission-edit = only visible if user can edit pages
	 *
	 * @return bool
	 */
	private function shouldShowPageTools(): bool {
		$condition = $this->config->get( 'CitizenShowPageTools' );
		$user = $this->user;

		// Login-based condition, return true if condition is met
		if ( $condition === 'login' ) {
			$condition = $user->isRegistered();
		}

		// Permission-based condition, return true if condition is met
		if ( is_string( $condition ) && strpos( $condition, 'permission' ) === 0 ) {
			$permission = substr( $condition, 11 );
			try {
				$title = $this->title;
				$condition = MediaWikiServices::getInstance()->getPermissionManager()->userCan(
					$permission, $user, $title );
			} catch ( Exception $e ) {
				$condition = false;
			}
		}

		return (bool)$condition;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$hasLanguages =
			( $this->languagesData && $this->languagesData[ 'is-empty' ] !== true ) ||
			( $this->variantsData && $this->variantsData[ 'is-empty' ] !== true );
		$articleTools = $this->getArticleToolsData();

		return [
			'data-article-tools' => $articleTools,
			'is-visible' => $this->shouldShowPageTools(),
			// There are edge cases where the menu is completely empty
			'has-overflow' => (bool)$articleTools,
			'has-languages' => $hasLanguages,
			/*
			 * FIXME: ULS does not trigger for some reason, disabling it for now
			 * 'is-uls-ready' => $this->shouldShowULS( $variantsData ),
			 */
			'is-uls-ready' => false,
			'int-language-count' => $this->numLanguages,
			'is-sharable' => $this->title->exists() && $this->title->isContentPage(),
			'msg-citizen-share' => $this->localizer->msg( "citizen-share" )->text()
		];
	}
}
