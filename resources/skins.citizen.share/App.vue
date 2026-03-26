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
				:value="window.location.protocol + '//' + window.location.host + window.location.pathname">
			<button id="citizen-share-copy-button" @click="copyURL">
				<svg
					id="citizen-share-copy-button-icon-static"
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z" /></svg>
				<svg
					id="citizen-share-copy-button-icon-copied"
					class="hidden"
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					fill="currentColor"><path d="M382-208 122-468l90-90 170 170 366-366 90 90-456 456Z" /></svg>
			</button>
		</div>

		<div class="citizen-share-main__social-options">
			<div
				id="citizen-share-twitter"
				class="citizen-share-main__social-option"
				:data-url="'https://twitter.com/intent/tweet?text=' + encodeURIComponent( window.document.title ) + '&url=' + encodeURIComponent( window.location.href )"
				@click="openShareModal">
				<svg
					width="24px"
					height="24px"
					xmlns="http://www.w3.org/2000/svg"
					xml:space="preserve"
					viewBox="0 0 248 204">
					<path fill="currentColor" d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z" />
				</svg>
			</div>

			<div
				id="citizen-share-reddit"
				class="citizen-share-main__social-option"
				:data-url="'https://reddit.com/submit?title=' + encodeURIComponent( window.document.title ) + '&url=' + encodeURIComponent( window.location.href )"
				@click="openShareModal">
				<svg
					width="24px"
					height="24px"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 256 256"><path fill="currentColor" d="m154.04,60.36c2.22,9.41,10.67,16.42,20.76,16.42,11.78,0,21.33-9.55,21.33-21.33s-9.55-21.33-21.33-21.33c-10.3,0-18.89,7.3-20.89,17.01-17.25,1.85-30.72,16.48-30.72,34.21,0,.04,0,.07,0,.11-18.76.79-35.89,6.13-49.49,14.56-5.05-3.91-11.39-6.24-18.27-6.24-16.51,0-29.89,13.38-29.89,29.89,0,11.98,7.04,22.3,17.21,27.07.99,34.7,38.8,62.61,85.31,62.61s84.37-27.94,85.31-62.67c10.09-4.8,17.07-15.09,17.07-27,0-16.51-13.38-29.89-29.89-29.89-6.85,0-13.16,2.31-18.2,6.19-13.72-8.49-31.04-13.83-49.99-14.54,0-.03,0-.05,0-.08,0-12.7,9.44-23.24,21.68-24.97Zm-81.54,82.27c.5-10.84,7.7-19.16,16.07-19.16s14.77,8.79,14.27,19.63c-.5,10.84-6.75,14.78-15.13,14.78s-15.71-4.41-15.21-15.25Zm95.06-19.16c8.38,0,15.58,8.32,16.07,19.16.5,10.84-6.84,15.25-15.21,15.25s-14.63-3.93-15.13-14.78c-.5-10.84,5.89-19.63,14.27-19.63Zm-9.96,44.24c1.57.16,2.57,1.79,1.96,3.25-5.15,12.31-17.31,20.96-31.5,20.96s-26.34-8.65-31.5-20.96c-.61-1.46.39-3.09,1.96-3.25,9.2-.93,19.15-1.44,29.54-1.44s20.33.51,29.54,1.44Z" /></svg>
			</div>

			<div
				id="citizen-share-facebook"
				class="citizen-share-main__social-option"
				:data-url="'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent( window.location.href )"
				@click="openShareModal">
				<svg
					id="svg9"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:svg="http://www.w3.org/2000/svg"
					version="1.1"
					width="24px"
					height="24px"
					fill="currentColor"
					viewBox="0 0 666.66668 666.66717"><g transform="matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)"><g><g clip-path="url(#clipPath25)"><g transform="translate(447.9175,300)"><path
						id="path33"
						d="M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z" />
					</g></g></g></g></svg>
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
const { defineComponent } = require( 'vue' );

async function copyURL() {
	const url = window.location.protocol + '//' + window.location.host + window.location.pathname;
	try {
		const link = document.getElementById( 'citizen-share-link' );
		link.select();
		await navigator.clipboard.writeText( url );
	} catch ( e ) {
		const link = document.getElementById( 'citizen-share-link' );
		link.select();
		document.execCommand( 'copy' );
	}

	const copyButtonIconStatic = document.getElementById( 'citizen-share-copy-button-icon-static' );
	const copyButtonIconCopied = document.getElementById( 'citizen-share-copy-button-icon-copied' );

	copyButtonIconStatic.classList.add( 'hidden' );
	copyButtonIconCopied.classList.remove( 'hidden' );

	setTimeout( () => {
		copyButtonIconStatic.classList.remove( 'hidden' );
		copyButtonIconCopied.classList.add( 'hidden' );
	}, 2000 );
}

async function openShareModal( event ) {
	const url = event.currentTarget.getAttribute( 'data-url' );

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

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	components: {
	},
	setup() {
		return {
			window,
			copyURL,
			showMoreOptions,
			openShareModal
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
    width: var( --space-md );
    height: var( --space-md );
    fill: var( --color-inverted-fixed );
}

#citizen-share-copy-button:hover {
    background-color: var( --background-color-progressive--hover );
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

#citizen-share-twitter {
    background-color: #1da1f2;
}

#citizen-share-reddit {
    background-color: #ff4500;
}

#citizen-share-facebook {
    background-color: #0866ff;
}

</style>
