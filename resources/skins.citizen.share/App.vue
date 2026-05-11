<template>
	<div
		ref="viewport"
		class="citizen-share-main">
		<template v-if="view === 'default'">
			<div class="citizen-share-main__header">
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
					id="citizen-share-copy-button"
					class="citizen-share-main__copy-link__button"
					weight="quiet"
					:aria-label="copyButtonAriaLabel"
					autofocus
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
				v-if="showUrlControls"
				class="citizen-share-main__url-controls">
				<cdx-button
					v-if="showCopyShortUrl"
					class="citizen-share-main__copy-short-url"
					:class="{ 'citizen-share-main__copy-short-url--copied': shortUrlCopied }"
					size="large"
					:disabled="shortUrlLoading"
					@click="copyShortUrl">
					<cdx-icon :icon="copyShortUrlIcon"></cdx-icon>
					{{ copyShortUrlButtonLabel }}
				</cdx-button>
				<cdx-button
					v-if="showQrButton"
					size="large"
					@click="openQrView">
					<cdx-icon :icon="cdxIconQrCode"></cdx-icon>
					{{ i18n( 'citizen-share-show-qr' ) }}
				</cdx-button>
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
		</template>

		<template v-else-if="view === 'qr'">
			<div class="citizen-share-qr__header">
				<cdx-button
					weight="quiet"
					class="citizen-share-qr__back"
					:aria-label="i18n( 'citizen-share-back' )"
					@click="closeQrView">
					<cdx-icon :icon="cdxIconArrowPrevious"></cdx-icon>
				</cdx-button>
				<span class="citizen-share-qr__title">
					{{ i18n( 'citizen-share-qr-title' ) }}
				</span>
			</div>

			<div class="citizen-share-qr__body">
				<div
					v-if="qrLoading"
					class="citizen-share-qr__skeleton"
					role="status"
					:aria-label="i18n( 'citizen-share-qr-title' )"></div>

				<template v-else-if="qrError">
					<p class="citizen-share-qr__error">
						{{ i18n( 'citizen-share-qr-error' ) }}
					</p>
					<cdx-button weight="primary" @click="retryQr">
						{{ i18n( 'citizen-share-qr-retry' ) }}
					</cdx-button>
				</template>

				<template v-else>
					<img
						class="citizen-share-qr__image"
						:src="qrCode"
						alt=""
						aria-hidden="true">
					<p class="citizen-share-qr__hint">
						{{ i18n( 'citizen-share-qr-scan-hint' ) }}
					</p>
					<p class="citizen-share-qr__url">
						{{ shortUrlForQr }}
					</p>
				</template>
			</div>
		</template>
	</div>
</template>

<script>
const { defineComponent, inject, ref, computed, onMounted, onBeforeUnmount, nextTick } = require( 'vue' );
const { CdxButton, CdxIcon, CdxTextInput } = mw.loader.require( 'skins.citizen.share.codex' );
const { cdxIconArrowPrevious, cdxIconCheck, cdxIconCopy, cdxIconLink, cdxIconQrCode } = require( './icons.json' );
const { useUrlShortener } = require( './composables/useUrlShortener.js' );
const { useDialogResizeAnimation } = require( './composables/useDialogResizeAnimation.js' );
const { getShareIconMaskStyle } = require( './iconStyle.js' );

const SHARE_POPUP_WINDOW_NAME = 'citizen-share-popup';

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
		const urlShortenerConfig = inject( 'urlShortenerConfig', {
			available: false,
			qrAvailable: false
		} );
		const copied = ref( false );
		const shortUrlCopied = ref( false );
		const shortener = useUrlShortener();
		let copyTimer = null;
		let shortUrlCopyTimer = null;

		const pageURL = window.location.protocol + '//' +
			window.location.host +
			window.location.pathname +
			window.location.search;
		const pageTitle = window.document.title;

		const shareServices = computed( () => ( Array.isArray( shareServiceOptions ) ?
			shareServiceOptions : [] ) );

		const shortUrlLoading = computed(
			() => shortener.state.value.status === 'loading'
		);

		const integrationFailed = computed(
			() => shortener.state.value.status === 'error'
		);

		const showCopyShortUrl = computed(
			() => urlShortenerConfig.available && !integrationFailed.value
		);

		const showQrButton = computed(
			() => urlShortenerConfig.qrAvailable && !integrationFailed.value
		);

		const showUrlControls = computed(
			() => showCopyShortUrl.value || showQrButton.value
		);

		const copyShortUrlButtonLabel = computed( () => (
			shortUrlCopied.value ?
				i18n( 'citizen-share-short-url-copied' ) :
				i18n( 'citizen-share-copy-short-url' )
		) );

		const copyShortUrlIcon = computed(
			() => ( shortUrlCopied.value ? cdxIconCheck : cdxIconLink )
		);

		const view = ref( 'default' );

		const qrLoading = computed( () => shortener.state.value.status === 'loading' );
		const qrError = computed( () => shortener.state.value.status === 'error' );
		const qrCode = computed( () => shortener.state.value.qrCode );
		// The URL the QR actually encodes — supplied by the composable from
		// the API response (the API sometimes returns the QR for the
		// shortened URL, sometimes for the original; the composable tracks
		// which). Falls back to pageURL while the fetch is still in flight.
		const shortUrlForQr = computed(
			() => shortener.state.value.qrCodeFor || pageURL
		);

		function openQrView() {
			view.value = 'qr';
			if ( shortener.state.value.qrCode ) {
				// Cache hit — nothing to fetch.
				return;
			}
			shortener.fetch( pageURL, { withQr: true } ).catch( () => {
				// qrError picks this up from composable status.
			} );
		}

		function closeQrView() {
			view.value = 'default';
		}

		function retryQr() {
			shortener.fetch( pageURL, { withQr: true } ).catch( () => {
				// Stays in error state; UI keeps showing the retry button.
			} );
		}

		async function writeToClipboard( text ) {
			const link = document.getElementById( 'citizen-share-link' );
			try {
				if ( link ) {
					link.select();
				}
				// eslint-disable-next-line compat/compat
				await navigator.clipboard.writeText( text );
				return true;
			} catch ( e ) {
				if ( link ) {
					link.select();
					try {
						return document.execCommand( 'copy' );
					} catch ( ignored ) {
						// execCommand throws in some sandboxed contexts —
						// signal failure so we don't lie to the user.
					}
				}
				return false;
			}
		}

		function copyShortUrl() {
			shortener.fetch( pageURL, { withQr: false } ).then( async () => {
				const url = shortener.state.value.shortUrl;
				if ( !url ) {
					// The fetch resolved but didn't return a short URL (this
					// can happen if the API succeeded without shortening —
					// the toggle path didn't have to deal with that because
					// the UI swap covered it). Surface as an error.
					mw.notify( i18n( 'citizen-share-short-url-error' ), {
						tag: 'citizen-share',
						type: 'error'
					} );
					return;
				}
				const succeeded = await writeToClipboard( url );
				if ( !succeeded ) {
					return;
				}
				shortUrlCopied.value = true;
				clearTimeout( shortUrlCopyTimer );
				shortUrlCopyTimer = setTimeout( () => {
					shortUrlCopied.value = false;
				}, 2000 );
			}, () => {
				// `integrationFailed` derives from the composable status and
				// hides the button automatically; surface the toast.
				mw.notify( i18n( 'citizen-share-short-url-error' ), {
					tag: 'citizen-share',
					type: 'error'
				} );
			} );
		}

		const copyButtonAriaLabel = computed( () => (
			copied.value ?
				i18n( 'citizen-share-copied' ) :
				i18n( 'citizen-share-copy-link' )
		) );

		const copyStatusMessage = computed( () => (
			copied.value ? i18n( 'citizen-share-copied' ) : ''
		) );

		// replaces the {{url}} and {{title}} placeholders in the URL template.
		// Always uses the canonical page URL — the dedicated short-URL copy
		// button writes a short URL to the clipboard but doesn't change what
		// social tiles share, since social services unfurl the canonical URL
		// into richer previews.
		function buildURL( urlTemplate ) {
			return urlTemplate
				.replace( /\{\{url\}\}/g, encodeURIComponent( pageURL ) )
				.replace( /\{\{title\}\}/g, encodeURIComponent( pageTitle ) );
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
			const succeeded = await writeToClipboard( pageURL );
			if ( !succeeded ) {
				return;
			}
			copied.value = true;
			clearTimeout( copyTimer );
			copyTimer = setTimeout( () => {
				copied.value = false;
			}, 2000 );
		}

		onBeforeUnmount( () => {
			clearTimeout( copyTimer );
			clearTimeout( shortUrlCopyTimer );
		} );

		const viewport = ref( null );
		const dialogEl = typeof document !== 'undefined' ?
			document.getElementById( 'citizen-share-dialog' ) :
			null;
		const resizeAnimation = useDialogResizeAnimation( {
			container: dialogEl,
			viewport: viewport
		} );

		// On first mount, the dialog was already opened with showModal()
		// before this app existed — so the native `autofocus` attribute on
		// the copy button missed its chance. Move focus here so keyboard
		// users land on the copy action instead of the readonly input.
		// This is also where the resize animation attaches its observer,
		// since the Vue root element only has a measurable size after the
		// component is in the DOM.
		onMounted( () => {
			resizeAnimation.setup();
			nextTick( () => {
				const copyBtn = document.getElementById( 'citizen-share-copy-button' );
				if ( copyBtn ) {
					copyBtn.focus();
				}
			} );
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
			viewport,
			i18n,
			cdxIconArrowPrevious,
			cdxIconCheck,
			cdxIconCopy,
			cdxIconQrCode,
			copied,
			shortUrlCopied,
			copyButtonAriaLabel,
			copyStatusMessage,
			pageURL,
			shareServices,
			shareIconStylesByIndex,
			showUrlControls,
			showCopyShortUrl,
			showQrButton,
			shortUrlLoading,
			copyShortUrlButtonLabel,
			copyShortUrlIcon,
			copyShortUrl,
			view,
			qrLoading,
			qrError,
			qrCode,
			shortUrlForQr,
			openQrView,
			closeQrView,
			retryQr,
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

	&--copied &__input .cdx-text-input__input {
		color: var( --color-success );
		background-color: var( --background-color-success-subtle );
		border-color: var( --border-color-success );
	}

	&--copied &__button.cdx-button {
		color: var( --color-success );
	}
}

.citizen-share-main__copy-link__status {
	.mixin-citizen-screen-reader-only();
}

.citizen-share-main__url-controls {
	display: flex;
	flex-wrap: wrap;
	gap: var( --space-xs );
	align-items: center;

	// Each button grows to fill remaining space so the row feels
	// deliberate at full width. When the dialog is narrow enough that
	// both buttons can't fit side by side, `flex-wrap` drops them onto
	// their own lines and each then occupies the full row.
	> .cdx-button {
		flex-grow: 1;
	}
}

// Brief success styling that mirrors the copy-link field's --copied
// state — the button recolors green for the 2s it carries the
// "Short URL copied!" label before reverting to the resting state.
// `!important` clamps every Codex interaction state (hover/active/focus)
// in one rule rather than enumerating them.
.citizen-share-main__copy-short-url--copied.cdx-button {
	color: var( --color-success ) !important;
	background-color: var( --background-color-success-subtle ) !important;
	border-color: var( --border-color-success ) !important;
}

.citizen-share-main__social-options {
	display: grid;
	grid-template-columns: repeat( 3, minmax( 0, 1fr ) );
	gap: var( --space-xs );
	// Subtle divider between the URL section (copy field + url controls)
	// and the configured share services. The parent's flex `gap` provides
	// the matching breathing room above the rule, and `padding-top` mirrors
	// it below.
	padding-top: var( --space-md );
	border-top: var( --border-subtle );
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

.citizen-share-qr {
	&__header {
		display: flex;
		gap: var( --space-xs );
		align-items: center;
	}

	&__title {
		font-size: var( --font-size-large );
		font-weight: var( --font-weight-semi-bold );
		color: var( --color-emphasized );
	}

	&__body {
		display: flex;
		flex-direction: column;
		gap: var( --space-sm );
		align-items: center;
		padding: var( --space-md ) 0;
	}

	&__image,
	&__skeleton {
		width: 200px;
		height: 200px;
	}

	&__skeleton {
		background-color: var( --background-color-neutral-subtle );
		border-radius: var( --border-radius-base );
		animation: citizen-share-qr-pulse 1.4s ease-in-out infinite;
	}

	&__hint {
		margin: 0;
		color: var( --color-subtle );
	}

	&__url {
		margin: 0;
		font-family: monospace;
		color: var( --color-base );
		text-align: center;
		word-break: break-all;
	}

	&__error {
		margin: 0;
		color: var( --color-error );
	}
}

@keyframes citizen-share-qr-pulse {
	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}
</style>
