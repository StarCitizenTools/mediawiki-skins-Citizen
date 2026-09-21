<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * A panel in the page aside.
 *
 * A panel describes itself and supplies the template data its own partial
 * renders from, so the container can order, filter and render it without
 * knowing what it is.
 *
 * Placement describes behaviour the container does not implement yet. It is
 * declared here because the interface is not cached HTML — extending it later
 * is free, whereas finding that the markup cannot express it is not.
 *
 * How a panel collapses is deliberately not part of this contract while that
 * design is unsettled; a panel that needs to say something about it must wait
 * for the question to be answered rather than invent an answer here.
 *
 * @internal
 */
interface CitizenAsidePanel {

	/** Scrolls away with the article. */
	public const PLACEMENT_FLOW = 'flow';

	/** Stays in view. At most one panel may claim this. */
	public const PLACEMENT_PINNED = 'pinned';

	/** Stable identity: ordering, styling hook, and per-panel state. */
	public function getId(): string;

	/** Heading when open; the control's accessible name when collapsed. */
	public function getLabel(): string;

	/** Codex icon name. */
	public function getIcon(): string;

	/** Position in the stack, ascending. */
	public function getOrder(): int;

	/** Whether the panel has anything to show on this page. */
	public function hasContent(): bool;

	public function getPlacement(): string;

	/**
	 * Template data for the panel's own partial. The container nests it under
	 * `body`, so nothing a panel returns can meet the container's own keys.
	 */
	public function getTemplateData(): array;
}
