<template>
	<div class="citizen-command-palette-detail-panel" aria-live="polite">
		<slot name="header">
			<div
				v-if="detail.header"
				class="citizen-command-palette-detail-panel__header"
			>
				<div class="citizen-command-palette-detail-panel__header-text">
					<div class="citizen-command-palette-detail-panel__header-label">
						{{ detail.header.label }}
					</div>
					<div
						v-if="detail.header.description"
						class="citizen-command-palette-detail-panel__header-description"
					>
						{{ detail.header.description }}
					</div>
				</div>
				<cdx-button
					v-if="detail.header.copyValue"
					:aria-label="copyAriaLabel"
					:title="copyTooltip"
					weight="quiet"
					class="citizen-command-palette-detail-panel__header-copy"
					:class="{
						'citizen-command-palette-detail-panel__header-copy--copied': copied
					}"
					@click="onCopyClick"
				>
					<cdx-icon :icon="copied ? cdxIconCheck : cdxIconCopy" size="small"></cdx-icon>
				</cdx-button>
			</div>
		</slot>
		<dl
			v-if="detail.pairs && detail.pairs.length > 0"
			class="citizen-command-palette-detail-panel__pairs"
		>
			<div
				v-for="( pair, index ) in detail.pairs"
				:key="pair.key || index"
				class="citizen-command-palette-detail-panel__pair"
			>
				<dt class="citizen-command-palette-detail-panel__label">
					{{ pair.label }}
				</dt>
				<dd class="citizen-command-palette-detail-panel__value">
					<!-- eslint-disable-next-line mediawiki/no-vue-dynamic-i18n -- slot name is the consumer's pair key, not an i18n message -->
					<slot :name="pair.key || `pair-${index}`" :pair="pair">
						{{ pair.value }}
					</slot>
				</dd>
			</div>
		</dl>
	</div>
</template>

<script>
const { defineComponent, ref, computed, watch, onBeforeUnmount } = require( 'vue' );
const { CdxButton, CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconCopy, cdxIconCheck } = require( '../icons.json' );

const COPY_FEEDBACK_MS = 1500;

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteDetailPanel',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		detail: {
			type: Object,
			required: true,
			validator: ( val ) => Array.isArray( val.pairs ) || !!val.header
		},
		// Counter that increments when an external trigger (the keyboard
		// shortcut, currently) wants the panel to copy `detail.header.copyValue`.
		// The watch invokes the same path as a click on the copy button so
		// users get identical visual feedback regardless of how they fired it.
		copyTrigger: {
			type: Number,
			default: 0
		}
	},
	setup( props ) {
		const copied = ref( false );
		let revertTimer = null;

		const copyAriaLabel = computed(
			() => mw.message( 'citizen-command-palette-detail-copy-action' ).text()
		);
		const copyFeedback = computed(
			() => mw.message( 'citizen-command-palette-detail-copy-feedback' ).text()
		);
		const copyTooltip = computed(
			() => copied.value ? copyFeedback.value : copyAriaLabel.value
		);

		function clearRevertTimer() {
			if ( revertTimer !== null ) {
				clearTimeout( revertTimer );
				revertTimer = null;
			}
		}

		async function onCopyClick() {
			const value = props.detail.header && props.detail.header.copyValue;
			if ( !value ) {
				return;
			}
			try {
				await navigator.clipboard.writeText( value );
				copied.value = true;
				clearRevertTimer();
				revertTimer = setTimeout( () => {
					copied.value = false;
					revertTimer = null;
				}, COPY_FEEDBACK_MS );
			} catch ( err ) {
				mw.log.error( '[commandPalette] Clipboard write failed:', err );
			}
		}

		// When the highlighted item changes (so the header label changes),
		// drop any in-flight feedback state — the user's mental model is
		// "copied THIS file's name", and the button should not appear to
		// confirm a copy that didn't happen.
		watch( () => props.detail.header && props.detail.header.copyValue, () => {
			clearRevertTimer();
			copied.value = false;
		} );

		// External trigger (e.g. Cmd/Ctrl+C from the keyboard handler).
		watch( () => props.copyTrigger, ( newVal, oldVal ) => {
			if ( newVal !== oldVal ) {
				onCopyClick();
			}
		} );

		onBeforeUnmount( clearRevertTimer );

		return {
			copied,
			copyAriaLabel,
			copyTooltip,
			cdxIconCopy,
			cdxIconCheck,
			onCopyClick
		};
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-detail-panel {
	padding: var( --space-md ) var( --citizen-command-palette-side-padding );
	overflow-y: auto;

	// Inline default header. Shown when a result's `detail.header` is set
	// and no consumer overrides the `header` slot.
	&__header {
		display: flex;
		gap: var( --space-xs );
		align-items: flex-start;
		padding-block-end: var( --space-md );
	}

	&__header-text {
		flex: 1;
		min-width: 0;
	}

	&__header-label {
		.mixin-citizen-font-styles( 'body' );
		font-weight: var( --font-weight-semi-bold );
		color: var( --color-emphasized );
		overflow-wrap: break-word;
	}

	&__header-description {
		color: var( --color-subtle );
	}

	&__header-copy {
		flex-shrink: 0;

		// Tint the check icon green during the post-copy feedback window
		// to reinforce that the action succeeded. `!important` overrides
		// CdxButton's own quiet-weight color rules, which are more
		// specific. Reverts when `copied` flips back off and the icon
		// returns to the clipboard glyph.
		&--copied {
			color: var( --color-success ) !important;
		}
	}

	&__pairs {
		display: flex;
		flex-direction: column;
		gap: var( --space-sm );
		margin: 0;
	}

	&__pair {
		display: flex;
		flex-direction: column;
		gap: var( --space-xs );
	}

	&__label {
		color: var( --color-subtle );
		.mixin-citizen-font-styles( 'overline' );
	}

	&__value {
		margin: 0;
		overflow-wrap: break-word;
	}
}
</style>
