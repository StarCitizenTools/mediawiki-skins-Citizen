const { computed } = require( 'vue' );
const { HELP_MODE_ID } = require( '../modes/help.js' );

/**
 * What the input means for the help overlay, which describes the active
 * mode without leaving it. At root, help is a mode of its own and needs
 * nothing from here.
 *
 * @param {Object} deps
 * @param {Object} deps.orchestrator useProviderOrchestration instance.
 * @param {Object} deps.tokenInput useTokenizedInput instance.
 * @return {Object}
 */
function useHelpInput( deps ) {
	const { orchestrator, tokenInput } = deps;

	/** Whether the overlay can open: inside any mode but help itself. */
	const helpAvailable = computed( () => {
		const mode = orchestrator.activeMode.value;
		return Boolean( mode ) && mode.id !== HELP_MODE_ID;
	} );

	/**
	 * Routes text from the input while a mode is active.
	 *
	 * A `?` into an empty input toggles the overlay, as its keybinding does,
	 * for keyboards that report no key on keydown and deliver the character
	 * only as text. Any other text closes the overlay: it describes the mode,
	 * so typing means the user is done reading and wants to search it.
	 *
	 * @param {string} text The input's new value.
	 * @return {boolean} Whether the text was consumed; when false the caller
	 *   hands it to the tokenized input as usual.
	 */
	function handleText( text ) {
		if (
			text === '?' &&
			helpAvailable.value &&
			tokenInput.freeText.value === '' &&
			tokenInput.tokens.value.length === 0
		) {
			orchestrator.toggleHelp();
			return true;
		}
		if ( orchestrator.helpVisible.value ) {
			// Typed text is a new query, and dispatching it refills the list.
			// An emptied input can leave the query as it was, so only a re-run
			// is sure to bring the list back.
			orchestrator.closeHelp( { rerun: text === '' } );
		}
		return false;
	}

	return { helpAvailable, handleText };
}

module.exports = useHelpInput;
