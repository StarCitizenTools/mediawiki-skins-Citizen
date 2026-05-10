<template>
	<div class="citizen-share-main">
		<div id="citizen-share-dialog-title" class="citizen-share-main__header">
			{{ i18n( 'citizen-share' ) }}
		</div>

		<div
			class="citizen-share-main__copy-link"
			:class="{ 'citizen-share-main__copy-link--copied': copied }"
			@click="copyURL">
			<cdx-text-input
				id="citizen-share-link"
				class="citizen-share-main__copy-link__input"
				:model-value="pageURL"
				readonly></cdx-text-input>
			<cdx-button
				class="citizen-share-main__copy-link__button"
				weight="quiet"
				:aria-label="copyButtonAriaLabel"
				@click.stop="copyURL">
				<cdx-icon :icon="copied ? cdxIconCheck : cdxIconCopy"></cdx-icon>
			</cdx-button>
			<div
				class="citizen-share-main__copy-link__status"
				role="status"
				aria-live="polite">
				{{ copyStatusMessage }}
			</div>
		</div>

		<div
			v-if="shareServices.length"
			class="citizen-share-main__social-options">
			<cdx-button
				v-for="( service, index ) in shareServices"
				:id="shareServiceElementId( service, index )"
				:key="`${ service.label }-${ index }`"
				class="citizen-share-main__social-option"
				weight="primary"
				size="large"
				:aria-label="service.label"
				:title="service.label"
				:style="{ backgroundColor: service.color }"
				@click="openShareModal( service )">
				<span
					v-if="shareIconStylesByIndex[ index ]"
					class="citizen-share-icon"
					:style="shareIconStylesByIndex[ index ]"
					aria-hidden="true"></span>
			</cdx-button>
		</div>
	</div>
</template>

<script>
const { defineComponent, inject, ref, computed, onBeforeUnmount } = require( 'vue' );
const { CdxButton, CdxIcon, CdxTextInput } = mw.loader.require( 'skins.citizen.share.codex' );
const { cdxIconCheck, cdxIconCopy } = require( './icons.json' );

const SHARE_POPUP_WINDOW_NAME = 'citizen-share-popup';

/**
 * @param {string} inner
 * @return {string}
 */
function escapeForCssUrl( inner ) {
	return inner.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' );
}

/**
 * @param {string} href
 * @return {string}
 */
function cssUrlFunction( href ) {
	return `url("${ escapeForCssUrl( href ) }")`;
}

/**
 * @param {string} raw
 * @return {string}
 */
function stripUrlWrapper( raw ) {
	const trimmed = raw.trim();
	if ( /^url\s*\(/i.test( trimmed ) && trimmed.endsWith( ')' ) ) {
		let inner = trimmed.replace( /^url\s*\(\s*/i, '' ).replace( /\s*\)\s*$/, '' );
		if (
			( inner.startsWith( '"' ) && inner.endsWith( '"' ) ) ||
			( inner.startsWith( '\'' ) && inner.endsWith( '\'' ) )
		) {
			inner = inner.slice( 1, -1 );
		}
		return inner.trim();
	}
	return trimmed;
}

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	components: { CdxButton, CdxIcon, CdxTextInput },
	setup() {
		function i18n( key ) {
			// eslint-disable-next-line mediawiki/msg-doc -- keys are fixed in template or passed explicitly
			return mw.msg( key );
		}

		const shareServiceOptions = inject( 'shareServiceOptions', [] );
		const copied = ref( false );
		let copyTimer = null;

		const pageURL = window.location.protocol + '//' +
			window.location.host +
			window.location.pathname +
			window.location.search;
		const pageTitle = window.document.title;

		const shareServices = computed( () => ( Array.isArray( shareServiceOptions ) ?
			shareServiceOptions : [] ) );

		const copyButtonAriaLabel = computed( () => (
			copied.value ?
				i18n( 'citizen-share-copied' ) :
				i18n( 'citizen-share-copy-link' )
		) );

		const copyStatusMessage = computed( () => (
			copied.value ? i18n( 'citizen-share-copied' ) : ''
		) );

		// replaces the {{url}} and {{title}} placeholders in the URL template
		function buildURL( urlTemplate ) {
			return urlTemplate
				.replace( /\{\{url\}\}/g, encodeURIComponent( pageURL ) )
				.replace( /\{\{title\}\}/g, encodeURIComponent( pageTitle ) );
		}

		/**
		 * @param {Object} service
		 * @return {string}
		 */
		function resolveShareIconHref( service ) {
			if ( typeof service.icon === 'string' && service.icon.trim() !== '' ) {
				return stripUrlWrapper( service.icon );
			}
			if ( typeof service.file === 'string' && service.file.trim() !== '' ) {
				return mw.util.getUrl( 'Special:FilePath/' + service.file.trim() );
			}
			return '';
		}

		/**
		 * @param {Object} service
		 * @return {Object|undefined}
		 */
		function getShareIconMaskStyle( service ) {
			const href = resolveShareIconHref( service );
			if ( !href ) {
				return undefined;
			}
			const u = cssUrlFunction( href );
			return {
				backgroundColor: '#fff',
				maskImage: u,
				WebkitMaskImage: u,
				maskSize: 'contain',
				maskRepeat: 'no-repeat',
				maskPosition: 'center',
				WebkitMaskSize: 'contain',
				WebkitMaskRepeat: 'no-repeat',
				WebkitMaskPosition: 'center'
			};
		}

		const shareIconStylesByIndex = computed( () => (
			shareServices.value.map( ( s ) => getShareIconMaskStyle( s ) )
		) );

		/**
		 * @param {Object} service
		 * @param {number} index
		 * @return {string}
		 */
		function shareServiceElementId( service, index ) {
			const raw = typeof service.name === 'string' ? service.name.trim() : '';
			const safe = raw.replace( /[^a-zA-Z0-9_-]/g, '' );
			const suffix = safe !== '' ? safe : String( index );
			return 'citizen-share-service-' + suffix;
		}

		async function copyURL() {
			const link = document.getElementById( 'citizen-share-link' );

			// try two different methods as navigator.clipboard is not available in all browsers
			try {
				if ( link ) {
					link.select();
				}
				// eslint-disable-next-line compat/compat
				await navigator.clipboard.writeText( pageURL );
			} catch ( e ) {
				if ( link ) {
					link.select();
					document.execCommand( 'copy' );
				}
			}

			copied.value = true;
			clearTimeout( copyTimer );
			copyTimer = setTimeout( () => {
				copied.value = false;
			}, 2000 );
		}

		onBeforeUnmount( () => {
			clearTimeout( copyTimer );
		} );

		function openShareModal( service ) {
			const url = buildURL( service.url );
			if ( !url ) {
				return;
			}

			if ( !service.open_in_modal ) {
				window.open( url, '_blank', 'noopener,noreferrer' );
				return;
			}

			// mailto: links should navigate directly regardless
			if ( url.startsWith( 'mailto:' ) ) {
				window.location.href = url; // mailto links are fine to open in the same tab
				return;
			}

			try {
				const width = 600;
				const height = 400;
				const left = ( screen.width - width ) / 2;
				const top = ( screen.height - height ) / 2;
				const features = `width=${ width },height=${ height },top=${ top },left=${ left },resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes,noopener,noreferrer`;

				// noopener makes window.open return null, so the focus call is best-effort only
				const newWindow = window.open( url, SHARE_POPUP_WINDOW_NAME, features );
				if ( newWindow ) {
					newWindow.focus();
				}
			} catch ( e ) {
				window.open( url, '_blank', 'noopener,noreferrer' );
			}
		}

		return {
			i18n,
			cdxIconCheck,
			cdxIconCopy,
			copied,
			copyButtonAriaLabel,
			copyStatusMessage,
			pageURL,
			shareServices,
			shareIconStylesByIndex,
			copyURL,
			openShareModal,
			shareServiceElementId
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../mixins.less';

.citizen-share-main {
	display: flex;
	flex-direction: column;
	gap: var( --space-md );
	padding: var( --space-md );
}

.citizen-share-main__header {
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-semi-bold );
	line-height: var( --line-height-large );
	color: var( --color-emphasized );
}

.citizen-share-main__copy-link {
	position: relative;
	cursor: pointer;

	&__input .cdx-text-input__input {
		// Click handler on the wrapper triggers copy; the input itself
		// is readonly, so the text cursor would mislead users. The
		// overlaid button is the keyboard-focusable copy action — the
		// padding-inline-end clears space for it so long URLs don't slide
		// under the button.
		min-height: @min-size-interactive-touch;
		padding-inline-end: 2.5rem;
		cursor: pointer;
	}

	&__button.cdx-button {
		position: absolute;
		inset-inline-end: var( --space-xxs );
		top: 50%;
		transform: translateY( -50% );
	}

	&--copied &__button.cdx-button {
		color: var( --color-success );
	}
}

.citizen-share-main__copy-link__status {
	.mixin-citizen-screen-reader-only();
}

.citizen-share-main__social-options {
	display: grid;
	grid-template-columns: repeat( 3, minmax( 0, 1fr ) );
	gap: var( --space-xs );
}

.citizen-share-main__social-option.cdx-button {
	// Brand-color tile: background comes from the per-service inline
	// style, icon goes white via the masked .citizen-share-icon child.
	min-width: 0;
	color: #fff;

	&:hover,
	&:active {
		// Preserve the brand color on hover; the default Codex hover
		// background would override the inline style.
		background-color: inherit;
		filter: brightness( 0.9 );
	}
}

.citizen-share-icon {
	box-sizing: border-box;
	display: block;
	width: @size-icon-medium;
	height: @size-icon-medium;
}
</style>
