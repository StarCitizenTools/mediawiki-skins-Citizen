<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * A page aside panel a wiki declares on-wiki and a script fills.
 *
 * The server renders the frame — heading and an empty body — on pages that
 * load the module named in the declaration, so the column and the panel's
 * place in it are settled before first paint. The script claims the frame
 * through citizen.pageAside.register and fills the body.
 */
class CitizenAsidePanelDeclared implements CitizenAsidePanel {

	/** Page under the MediaWiki namespace holding the declarations. */
	public const PAGE_NAME = 'Citizen-page-aside.json';

	/** Same as the client registry, so an id it accepts is accepted here. */
	private const ID_PATTERN = '/^[a-z][a-z0-9-]*$/';

	/** Same as the client registry, so a declaration and a register() call agree. */
	private const DEFAULT_ORDER = 100;

	private function __construct(
		private readonly MessageLocalizer $localizer,
		private readonly string $id,
		private readonly ?string $labelMsg,
		private readonly string $label,
		private readonly string $module,
		private readonly string $placement,
		private readonly int $order,
		private readonly bool $isModuleLoaded
	) {
	}

	/**
	 * A declaration that fails validation is skipped, and the others still apply.
	 *
	 * @param array $config Parsed declaration page
	 * @param string[] $loadedModules Modules the page loads
	 * @param MessageLocalizer $localizer
	 * @return self[] One panel per valid declaration, in declaration order
	 */
	public static function fromConfig( array $config, array $loadedModules, MessageLocalizer $localizer ): array {
		$declarations = $config['panels'] ?? [];
		if ( !is_array( $declarations ) ) {
			return [];
		}

		$panels = [];
		foreach ( $declarations as $id => $declaration ) {
			// json_decode turns numeric JSON keys into ints
			$id = (string)$id;
			if ( preg_match( self::ID_PATTERN, $id ) !== 1 || !is_array( $declaration ) ) {
				continue;
			}

			$module = $declaration['module'] ?? null;
			$labelMsg = $declaration['labelMsg'] ?? null;
			$label = $declaration['label'] ?? '';
			$placement = $declaration['placement'] ?? self::PLACEMENT_FLOW;
			$order = $declaration['order'] ?? self::DEFAULT_ORDER;

			$labelMsg = is_string( $labelMsg ) && $labelMsg !== '' ? $labelMsg : null;
			$label = is_string( $label ) ? $label : '';
			if (
				!is_string( $module ) || $module === '' ||
				( $labelMsg === null && trim( $label ) === '' ) ||
				!in_array( $placement, [ self::PLACEMENT_FLOW, self::PLACEMENT_STICKY ], true ) ||
				!is_int( $order )
			) {
				continue;
			}

			$panels[] = new self(
				$localizer,
				$id,
				$labelMsg,
				$label,
				$module,
				$placement,
				$order,
				in_array( $module, $loadedModules, true )
			);
		}
		return $panels;
	}

	public function getId(): string {
		return $this->id;
	}

	public function getLabel(): string {
		return $this->labelMsg !== null
			? $this->localizer->msg( $this->labelMsg )->text()
			: $this->label;
	}

	public function getIcon(): string {
		return '';
	}

	public function getOrder(): int {
		return $this->order;
	}

	/**
	 * Whether the script that fills the panel runs on this page, which is the
	 * only thing a server-rendered frame can know about the panel's content.
	 */
	public function hasContent(): bool {
		return $this->isModuleLoaded;
	}

	public function getPlacement(): string {
		return $this->placement;
	}

	public function getModule(): ?string {
		return $this->module;
	}

	public function getTemplateData(): array {
		return [];
	}
}
