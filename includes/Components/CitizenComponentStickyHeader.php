<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentStickyHeader component
 */
class CitizenComponentStickyHeader implements CitizenComponent {

	private const SHARE_ICON = [
		'id' => 'citizen-share-sticky-header',
		'clickTarget' => '#citizen-share',
		'icon' => 'wikimedia-share'
	];

	private const TALK_ICON = [
		'id' => 'ca-talk-sticky-header',
		'clickTarget' => '#ca-talk > a',
		'icon' => 'speechBubbles'
	];

	private const SUBJECT_ICON = [
		'id' => 'ca-subject-sticky-header',
		'clickTarget' => '#ca-subject > a',
		'icon' => 'article'
	];

	private const HISTORY_ICON = [
		'id' => 'ca-history-sticky-header',
		'clickTarget' => '#ca-history > a',
		'icon' => 'wikimedia-history'
	];

	private const EDIT_VE_ICON = [
		'id' => 'ca-ve-edit-sticky-header',
		'clickTarget' => '#ca-ve-edit > a',
		'icon' => 'wikimedia-edit'
	];

	private const EDIT_WIKITEXT_ICON = [
		'id' => 'ca-edit-sticky-header',
		'clickTarget' => '#ca-edit > a',
		'icon' => 'wikimedia-wikiText'
	];

	private const EDIT_PROTECTED_ICON = [
		'id' => 'ca-viewsource-sticky-header',
		'clickTarget' => '#ca-viewsource > a',
		'icon' => 'wikimedia-editLock'
	];

	private const ADD_SECTION_ICON = [
		'id' => 'ca-addsection-sticky-header',
		'clickTarget' => '#ca-addsection > a',
		'icon' => 'speechBubbleAdd'
	];

	public function __construct(
		private bool $visualEditorTabPositionFirst = false
	) {
	}

	/**
	 * Creates array of Button components in the sticky header
	 */
	private function getIconButtons(): array {
		$icons = [
			self::SHARE_ICON,
			self::HISTORY_ICON,
			$this->visualEditorTabPositionFirst ? self::EDIT_VE_ICON : self::EDIT_WIKITEXT_ICON,
			$this->visualEditorTabPositionFirst ? self::EDIT_WIKITEXT_ICON : self::EDIT_VE_ICON,
			self::EDIT_PROTECTED_ICON,
			self::ADD_SECTION_ICON,
			self::TALK_ICON,
			self::SUBJECT_ICON
		];
		$iconButtons = [];
		foreach ( $icons as $icon ) {
			$button = new CitizenComponentButton(
				"",
				$icon[ 'icon' ],
				$icon[ 'id' ],
				$icon[ 'class' ] ?? '',
				[
					'tabindex' => '-1',
					'data-mw-citizen-click-target' => $icon[ 'clickTarget' ] ?? null,
				],
				'quiet',
				'default',
				'large',
				true,
				null
			);
			$iconButtons[] = $button->getTemplateData();
		}
		return $iconButtons;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
			'array-icon-buttons' => $this->getIconButtons()
		];
	}
}
