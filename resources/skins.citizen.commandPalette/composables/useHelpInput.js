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
	const { orchestrator } = deps;

	/** Whether the overlay can open: inside any mode but help itself. */
	const helpAvailable = computed( () => {
		const mode = orchestrator.activeMode.value;
		return Boolean( mode ) && mode.id !== HELP_MODE_ID;
	} );

	return { helpAvailable };
}

module.exports = useHelpInput;
