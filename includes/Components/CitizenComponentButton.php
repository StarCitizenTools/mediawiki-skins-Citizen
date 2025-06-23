<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentButton component
 *
 * This implements the Codex CSS-only button component
 * Based on VectorComponentButton
 * @see https://doc.wikimedia.org/codex/main/components/demos/button.html
 */
class CitizenComponentButton implements CitizenComponent {

	public function __construct(
		private string $label = '',
		private ?string $icon = null,
		private ?string $id = null,
		private ?string $class = null,
		private array $attributes = [],
		private string $weight = 'normal',
		private string $action = 'default',
		private string $size = 'medium',
		private bool $iconOnly = false,
		private ?string $href = null
	) {
		// Weight can only be normal, primary, or quiet
		if ( $this->weight !== 'primary' && $this->weight !== 'quiet' ) {
			$this->weight = 'normal';
		}
		// Action can only be default, progressive or destructive
		if ( $this->action !== 'progressive' && $this->action !== 'destructive' ) {
			$this->action = 'default';
		}
		// Size can only be medium or large
		if ( $this->size !== 'medium' && $this->size !== 'large' ) {
			$this->size = 'medium';
		}
	}

	/**
	 * Constructs button classes based on the props
	 */
	private function getClasses(): string {
		$classes = 'cdx-button';
		if ( $this->href ) {
			$classes .= ' cdx-button--fake-button cdx-button--fake-button--enabled';
		}
		switch ( $this->weight ) {
			case 'primary':
				$classes .= ' cdx-button--weight-primary';
				break;
			case 'quiet':
				$classes .= ' cdx-button--weight-quiet';
				break;
			case 'normal':
			default:
				$classes .= ' cdx-button--weight-normal';
				break;
		}
		switch ( $this->action ) {
			case 'progressive':
				$classes .= ' cdx-button--action-progressive';
				break;
			case 'destructive':
				$classes .= ' cdx-button--action-destructive';
				break;
			case 'default':
			default:
				$classes .= ' cdx-button--action-default';
				break;
		}
		switch ( $this->size ) {
			case 'large':
				$classes .= ' cdx-button--size-large';
				break;
			case 'medium':
			default:
				$classes .= ' cdx-button--size-medium';
				break;
		}
		if ( $this->iconOnly ) {
			$classes .= ' cdx-button--icon-only';
		}
		if ( $this->class ) {
			$classes .= ' ' . $this->class;
		}
		return $classes;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$arrayAttributes = [];
		foreach ( $this->attributes as $key => $value ) {
			if ( $value === null ) {
				continue;
			}
			$arrayAttributes[] = [ 'key' => $key, 'value' => $value ];
		}
		return [
			'label' => $this->label,
			'icon' => $this->icon,
			'id' => $this->id,
			'class' => $this->getClasses(),
			'href' => $this->href,
			'array-attributes' => $arrayAttributes
		];
	}
}
