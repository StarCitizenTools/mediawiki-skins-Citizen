<template>
	<div class="citizen-share-main">
		<div class="citizen-share-main__header">
			Share this article
			<div class="citizen-share-main__header__description">
				Share a link to this article:
			</div>
		</div>

		<div class="citizen-share-main__copy-link">
			<input
				id="citizen-share-link"
				type="text"
				readonly
				:value="pageURL">
			<button id="citizen-share-copy-button" :aria-label="copied ? 'Copied' : 'Copy link'" @click="copyURL">
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
		</div>

		<div
			v-if="shareServices.length"
			class="citizen-share-main__social-options">
			<div
				v-for="service in shareServices"
				:key="service.label"
				class="citizen-share-main__social-option"
				:style="{ backgroundColor: service.color }"
				:title="service.label"
				:data-url="buildURL( service.url )"
				:data-open-in-modal="service.open_in_modal"
				@click="openShareModal">
				<img
					v-if="service.icon"
					class="citizen-share-icon citizen-share-icon--img"
					:src="service.icon"
					:alt="service.label">
				<span
					v-else-if="service.icon_class"
					class="citizen-share-icon citizen-share-icon--mask"
					:class="service.icon_class">
				</span>
				<img
					v-else-if="service.file"
					class="citizen-share-icon citizen-share-icon--img"
					:src="getFilePath( service.file )"
					:alt="service.label">
			</div>
		</div>

		<div class="citizen-share-main__other">
			<button id="citizen-share-native-options" @click="showMoreOptions">
				More options...
			</button>
		</div>
	</div>
</template>

<script>
const { defineComponent, inject, ref, computed } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	setup() {
		const shareServiceOptions = inject( 'shareServiceOptions', [] );
		const copied = ref( false );
		let copyTimer = null;

		const pageURL = window.location.protocol + '//' + window.location.host + window.location.pathname;
		const pageTitle = window.document.title;

		/** @type {import('vue').ComputedRef<Array>} */
		const shareServices = computed( () => ( Array.isArray( shareServiceOptions ) ? shareServiceOptions : [] ) );

		function buildURL( urlTemplate ) {
			return urlTemplate
				.replace( /\{\{url\}\}/g, encodeURIComponent( window.location.href ) )
				.replace( /\{\{title\}\}/g, encodeURIComponent( pageTitle ) );
		}

		async function copyURL() {
			const link = document.getElementById( 'citizen-share-link' );
			try {
				if ( link ) {
					link.select();
				}
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
			await navigator.share( {
				title: document.title,
				text: document.title,
				url: window.location.href
			} );
		}

		function getFilePath( file ) {
			return mw.util.getUrl( 'Special:FilePath/' + file );
		}

		return {
			copied,
			pageURL,
			shareServices,
			buildURL,
			copyURL,
			openShareModal,
			showMoreOptions,
			getFilePath
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
	color: var( --color-emphasized );
	font-size: var( --font-size-large );
	font-weight: var( --font-weight-semi-bold );
	line-height: var( --line-height-large );
	margin-bottom: var( --space-xs );
}

.citizen-share-main__header__description {
	color: var( --color-subtle );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-small );
}

.citizen-share-main__copy-link {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

#citizen-share-link {
	width: auto;
	outline: none;
	padding: var( --space-xs ) var( --space-sm );
	border-radius: var( --border-radius-medium );
	border-width: 2px;
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
	border-color: var( --border-color-input--hover );
	field-sizing: content;
	max-width: 400px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

#citizen-share-link:focus {
	border-color: var( --background-color-progressive );
}

#citizen-share-copy-button {
	background-color: var( --background-color-progressive );
	color: var( --color-surface-0 );
	border: none;
	padding: var( --space-xs ) var( --space-sm );
	border-radius: var( --border-radius-medium );
	border-top-left-radius: 0px;
	border-bottom-left-radius: 0px;
	cursor: pointer;
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
	border-radius: var( --border-radius-medium );
	padding: var( --space-xs );
	color: #fff;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 40px;
}

.citizen-share-icon--img {
	display: block;
	width: 100%;
	height: 100%; // padding should adjust the size properly
	filter: brightness( 0 ) invert( 1 );
}

.citizen-share-icon--mask {
	display: block;
	width: 100%;
	height: 100%;
}

.citizen-share-main__other {
	margin-top: var( --space-md );
}

#citizen-share-native-options {
	background-color: var( --background-color-button-quiet );
	color: var( --color-emphasized );
	padding: var( --space-xs ) var( --space-sm );
	border-radius: var( --border-radius-medium );
	cursor: pointer;
	width: 100%;
}

#citizen-share-native-options:hover {
	background-color: var( --background-color-button-quiet--active );
}
</style>
