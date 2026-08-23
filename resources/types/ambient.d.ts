// Globals the skin reads that no upstream package declares.

interface Window {
	// Provided by the InstantDiffs gadget when installed; absent otherwise, so
	// every read is guarded.
	instantDiffs?: { isReady?: boolean };
}

interface Navigator {
	// User-Agent Client Hints. Not in lib.dom yet and unsupported in Firefox and
	// Safari, so every read is guarded.
	userAgentData?: { platform?: string };
}
