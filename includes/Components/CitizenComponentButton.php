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
		$this->weight = match ( $this->weight ) {
			'primary', 'quiet' => $this->weight,
			default => 'normal',
		};
		$this->action = match ( $this->action ) {
			'progressive', 'destructive' => $this->action,
			default => 'default',
		};
		$this->size = match ( $this->size ) {
			'large' => 'large',
			default => 'medium',
		};
	}

	/**
	 * Constructs button classes based on the props
	 */
	private function getClasses(): string {
		$classes = 'cdx-button';
		if ( $this->href ) {
			$classes .= ' cdx-button--fake-button cdx-button--fake-button--enabled';
		}
		$classes .= match ( $this->weight ) {
			'primary' => ' cdx-button--weight-primary',
			'quiet' => ' cdx-button--weight-quiet',
			default => ' cdx-button--weight-normal',
		};
		$classes .= match ( $this->action ) {
			'progressive' => ' cdx-button--action-progressive',
			'destructive' => ' cdx-button--action-destructive',
			default => ' cdx-button--action-default',
		};
		$classes .= match ( $this->size ) {
			'large' => ' cdx-button--size-large',
			default => ' cdx-button--size-medium',
		};
		if ( $this->iconOnly ) {
			$classes .= ' cdx-button--icon-only';
		}
		if ( $this->class ) {
			$classes .= ' ' . $this->class;
		}
		return $classes;
	}

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
