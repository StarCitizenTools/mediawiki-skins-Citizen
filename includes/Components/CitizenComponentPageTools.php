<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Exception;
use MediaWiki\Config\Config;
use MediaWiki\Permissions\PermissionManager;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MessageLocalizer;

/**
 * CitizenComponentPageTools component
 * FIXME: Need unit test
 */
class CitizenComponentPageTools implements CitizenComponent {

	public function __construct(
		private Config $config,
		private MessageLocalizer $localizer,
		private Title $title,
		private User $user,
		private PermissionManager $permissionManager,
		private int $numLanguages,
		private array $sidebarData,
		private array $languagesData,
		private array $variantsData
	) {
	}

	/**
	 * Extract article tools from sidebar and return the data
	 *
	 * The reason we do this is because:
	 * 1. We removed some site-wide tools from the toolbar in Drawer.php,
	 * 	  now we just want the leftovers
	 * 2. Toolbox is not currently avaliable as data-portlet, have to wait
	 *    till Desktop Improvements
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
				$condition = $this->permissionManager->userCan(
					$permission, $user, $this->title );
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
