<template>
	<div class="citizen-share-main">
		<div class="citizen-share-main__header">
			{{ i18n( 'citizen-share' ) }}
			<div class="citizen-share-main__header__description">
				{{ i18n( 'citizen-share-link-description' ) }}
			</div>
		</div>

		<div class="citizen-share-main__copy-link">
			<input
				id="citizen-share-link"
				type="text"
				readonly
				:size="linkInputSize"
				:value="pageURL">
			<!-- eslint-disable max-len -- copy icon paths -->
			<button
				id="citizen-share-copy-button"
				:aria-label="copyButtonAriaLabel"
				@click="copyURL">
				<svg
					v-if="!copied"
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z" /></svg>
				<svg
					v-else
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					fill="currentColor"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z" /></svg>
			</button>
			<!-- eslint-enable max-len -->
		</div>

		<div
			v-if="shareServices.length"
			class="citizen-share-main__social-options">
			<div
				v-for="( service, index ) in shareServices"
				:id="shareServiceElementId( service, index )"
				:key="`${ service.label }-${ index }`"
				class="citizen-share-main__social-option"
				role="button"
				tabindex="0"
				:aria-label="service.label"
				:style="{ backgroundColor: service.color }"
				:title="service.label"
				:data-url="buildURL( service.url )"
				:data-open-in-modal="service.open_in_modal"
				@click="openShareModal"
				@keydown="onShareServiceKeydown">
				<span
					v-if="shareIconStylesByIndex[ index ]"
					class="citizen-share-icon"
					:style="shareIconStylesByIndex[ index ]"
					aria-hidden="true">
				</span>
			</div>
		</div>

		<div class="citizen-share-main__other">
			<button
				v-if="canShare"
				id="citizen-share-native-options"
				@click="showMoreOptions">
				{{ i18n( 'citizen-share-native-options' ) }}
			</button>
		</div>
	</div>
</template>

<script>
const { defineComponent, inject, ref, computed } = require( 'vue' );

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

		const canShare = computed( () => typeof navigator !== 'undefined' &&
			typeof navigator.share === 'function' );

		const shareServices = computed( () => ( Array.isArray( shareServiceOptions ) ?
			shareServiceOptions : [] ) );

		const copyButtonAriaLabel = computed( () => (
			copied.value ?
				i18n( 'citizen-share-copied' ) :
				i18n( 'citizen-share-copy-link' )
		) );

		// avoid field-sizing; stylelint allows only baseline css
		const linkInputSize = computed( () => Math.min( 80, Math.max( 12, pageURL.length ) ) );

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

		/**
		 * @param {Event} event
		 * @return {void}
		 */
		function onShareServiceKeydown( event ) {
			if ( event.key !== 'Enter' && event.key !== ' ' ) {
				return;
			}
			event.preventDefault();
			openShareModal( event );
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

		function openShareModal( event ) {
			const url = event.currentTarget.getAttribute( 'data-url' );
			if ( !url ) {
				return;
			}
			const openInModal = event.currentTarget.getAttribute( 'data-open-in-modal' ) === 'true';

			if ( !openInModal ) {
				window.open( url, '_blank' );
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
				const features = `width=${ width },height=${ height },top=${ top },left=${ left },resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes`;

				const newWindow = window.open( url, 'Share this article', features );
				if ( newWindow ) {
					newWindow.focus();
				}
			} catch ( e ) {
				window.open( url, '_blank' );
			}
		}

		async function showMoreOptions() {
			if ( !canShare.value ) {
				return;
			}

			try {
				await navigator.share( {
					title: document.title,
					text: document.title,
					url: window.location.href
				} );
			} catch ( e ) {
				return;
			}
		}

		return {
			i18n,
			canShare,
			copied,
			copyButtonAriaLabel,
			pageURL,
			linkInputSize,
			shareServices,
			shareIconStylesByIndex,
			buildURL,
			copyURL,
			openShareModal,
			onShareServiceKeydown,
			showMoreOptions,
			shareServiceElementId
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-share-main {
	margin-inline: var( --space-md );
}

#citizen-share-dropdown__card {
	width: max-content;
}

.citizen-share-main__header {
	margin-bottom: var( --space-xs );
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-semi-bold );
	line-height: var( --line-height-large );
	color: var( --color-emphasized );
}

.citizen-share-main__header__description {
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
}

.citizen-share-main__copy-link {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

#citizen-share-link {
	width: auto;
	max-width: 400px;
	height: 32px;
	padding: var( --space-xs ) var( --space-sm );
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	outline: 2px solid transparent;
	outline-offset: 0;
	border-color: var( --border-color-input--hover );
	border-width: 2px;
	border-radius: var( --border-radius-medium );
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

#citizen-share-link:focus {
	border-color: var( --background-color-progressive );
}

#citizen-share-copy-button {
	padding: var( --space-xs ) var( --space-sm );
	color: var( --color-surface-0 );
	cursor: pointer;
	background-color: var( --background-color-progressive );
	border-radius: var( --border-radius-medium );
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

#citizen-share-copy-button svg {
	display: block;
	width: var( --space-md );
	height: var( --space-md );
	fill: var( --color-inverted-fixed );
}

#citizen-share-copy-button:hover {
	background-color: var( --background-color-progressive--hover );
}

.citizen-share-main__social-options {
	display: grid;
	grid-template-columns: repeat( auto-fit, minmax( 30%, 1fr ) );
	gap: var( --space-xs );
	margin-top: var( --space-md );
}

.citizen-share-main__social-option {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 40px;
	padding: var( --space-xs );
	color: #fff;
	cursor: pointer;
	border-radius: var( --border-radius-medium );
}

.citizen-share-main__social-option:focus {
	outline: 2px solid var( --background-color-progressive );
	outline-offset: 2px;
}

.citizen-share-icon {
	box-sizing: border-box;
	display: block;
	width: 100%;
	height: 100%;
}

.citizen-share-main__other {
	margin-top: var( --space-md );
}

#citizen-share-native-options {
	width: 100%;
	padding: var( --space-xs ) var( --space-sm );
	color: var( --color-emphasized );
	cursor: pointer;
	background-color: var( --background-color-button-quiet );
	border-radius: var( --border-radius-medium );
}

#citizen-share-native-options:hover {
	background-color: var( --background-color-button-quiet--active );
}
</style>
