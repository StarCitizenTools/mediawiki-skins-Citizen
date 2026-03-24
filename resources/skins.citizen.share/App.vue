<template>
	<div class="citizen-share-main">
        <div class="citizen-share-main__header">
            Share this article
            <div class="citizen-share-main__header__description">
                Share a link to this article:
            </div>
        </div>

        <div class="citizen-share-main__copy-link">
            <input type="text" readonly id="citizen-share-link" :value="window.location.href" />
            <button id="citizen-share-copy-button" @click="copyURL">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z"/></svg>
            </button>
            <!-- TODO i18n -->
        </div>

        <div class="citizen-share-main__social-options">
            
        </div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );


function copyURL() {
    const link = document.getElementById( 'citizen-share-link' );
    link.select();
    document.execCommand( 'copy' );
}   


// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	components: {
	},
	setup() {
		return {
			window,
			copyURL
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
    color: var(--color-emphasized);
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-semi-bold);
    line-height: var(--line-height-large);
    margin-bottom: var(--space-xs);
}

.citizen-share-main__header__description {
    color: var(--color-subtle);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-small);
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
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--border-radius-medium);
    border-width: 2px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    border-color: var(--border-color-input--hover);
    field-sizing: content;
}

#citizen-share-link:focus {
    border-color: var(--background-color-progressive);
}

#citizen-share-copy-button {
    background-color: var(--background-color-progressive);
    color: var(--color-surface-0);
    border: none;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--border-radius-medium);
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    cursor: pointer;
}

#citizen-share-copy-button svg {
    width: var(--space-md);
    height: var(--space-md);
    fill: var(--color-emphasized);
}

#citizen-share-copy-button:hover {
    background-color: var(--background-color-progressive--hover);
}
</style>