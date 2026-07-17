// Adopted from Vector 2022
/** @module SectionObserver */

/**
 * @callback OnIntersection
 * @param {Array<HTMLElement>} elements The sections currently visible in the viewport.
 */

/**
 * Observe intersection changes with the viewport for one or more elements. This
 * is intended to be used with the headings in the content so that the
 * corresponding section(s) in the table of contents can be "activated" (e.g.
 * bolded).
 *
 * When sectionObserver notices a new intersection change, the
 * `onIntersection` callback will be fired with the corresponding visible
 * sections as a param.
 *
 * Because sectionObserver uses a scroll event listener (in combination with
 * IntersectionObserver), the changes are throttled to a default maximum rate of
 * 200ms so that the main thread is not excessively blocked.
 * IntersectionObserver is used to asynchronously calculate the positions of the
 * observed tags off the main thread and in a manner that does not cause
 * expensive forced synchronous layouts.
 *
 * @param {Object} deps
 * @param {Window} deps.window
 * @param {Object} deps.mw - MediaWiki global (used for mw.log.warn).
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @param {NodeList} deps.elements - Elements to observe for intersection changes.
 * @param {number} [deps.topMargin] - Pixels to shrink the top of the viewport's
 *   bounding box before calculating intersections. Defaults to 0.
 * @param {number} [deps.throttleMs] - Milliseconds to throttle the scroll handler. Defaults to 200.
 * @param {OnIntersection} [deps.onIntersection] - Called when a new intersection is observed.
 * @return {SectionObserver}
 */
function createSectionObserver( deps ) {
	const {
		window: win,
		mw: mediawiki,
		IntersectionObserver: IntersectionObserverCtor,
		elements: initialElements,
		topMargin = 0,
		throttleMs = 200,
		onIntersection = () => {}
	} = deps;

	let elements = initialElements;
	let /** @type {number | undefined} */ timeoutId;
	let /** @type {Array<string>} */ currentIds = [];

	const observer = new IntersectionObserverCtor( ( entries ) => {
		if ( entries.length === 0 ) {
			return;
		}

		// Sort all entries by boundingClientRect.top (top to bottom).
		const sorted = entries.slice().sort(
			( a, b ) => a.boundingClientRect.top - b.boundingClientRect.top
		);

		// Partition into above-viewport and at-or-below-viewport entries.
		const above = sorted.filter(
			( entry ) => entry.boundingClientRect.top - topMargin <= 0
		);
		const below = sorted.filter(
			( entry ) => entry.boundingClientRect.top - topMargin > 0
		);

		// Start of range: closest heading above viewport top, or first below.
		let startIdx;
		if ( above.length > 0 ) {
			startIdx = sorted.indexOf( above[ above.length - 1 ] );
		} else {
			startIdx = sorted.indexOf( below[ 0 ] );
		}

		// End of range: last heading whose top is within the viewport height.
		// Starts from startIdx so the range always includes at least one element.
		let endIdx = startIdx;
		for ( let i = startIdx; i < sorted.length; i++ ) {
			if ( sorted[ i ].boundingClientRect.top < win.innerHeight ) {
				endIdx = i;
			}
		}

		// Collect active set from start to end (inclusive).
		const activeElements = sorted.slice( startIdx, endIdx + 1 ).map(
			( entry ) => /** @type {HTMLElement} */ ( entry.target )
		);

		// Compare with previous active set — only fire if changed.
		const activeIds = activeElements.map( ( el ) => el.id );
		if (
			activeIds.length !== currentIds.length ||
			activeIds.some( ( id, i ) => id !== currentIds[ i ] )
		) {
			onIntersection( activeElements );
		}
		currentIds = activeIds;

		// When finished finding the intersecting element, stop observing all
		// observed elements. The scroll event handler will be responsible for
		// throttling and reobserving the elements again. Because we don't have a
		// wrapper element around our content headings and their children, we can't
		// rely on IntersectionObserver (which is optimized to detect intersecting
		// elements *within* the viewport) to reliably fire this callback without
		// this manual step. Instead, we offload the work of calculating the
		// position of each element in an efficient manner to IntersectionObserver,
		// but do not use it to detect when a new element has entered the viewport.
		observer.disconnect();
	} );

	/**
	 * Calculate the intersection of each observed element.
	 */
	function calcIntersection() {
		// IntersectionObserver will asynchronously calculate the boundingClientRect
		// of each observed element off the main thread after `observe` is called.
		elements.forEach( ( element ) => {
			if ( !element.parentNode ) {
				mediawiki.log.warn( 'Element being observed is not in DOM', element );
				return;
			}
			observer.observe( /** @type {HTMLElement} */ ( element ) );
		} );
	}

	function handleScroll() {
		// Throttle the scroll event handler to fire at a rate limited by `throttleMs`.
		if ( !timeoutId ) {
			timeoutId = win.setTimeout( () => {
				calcIntersection();
				timeoutId = undefined;
			}, throttleMs );
		}
	}

	function bindScrollListener() {
		win.addEventListener( 'scroll', handleScroll );
	}

	function unbindScrollListener() {
		win.removeEventListener( 'scroll', handleScroll );
	}

	/**
	 * Pauses intersection observation until `resume` is called.
	 */
	function pause() {
		unbindScrollListener();
		clearTimeout( timeoutId );
		timeoutId = undefined;
		// Assume current is no longer valid while paused.
		currentIds = [];
	}

	/**
	 * Resumes intersection observation.
	 */
	function resume() {
		bindScrollListener();
	}

	/**
	 * Cleans up event listeners and intersection observer. Should be called when
	 * the observer is permanently no longer needed.
	 */
	function unmount() {
		unbindScrollListener();
		observer.disconnect();
	}

	/**
	 * Set a list of HTML elements to observe for intersection changes.
	 *
	 * @param {NodeList} list
	 */
	function setElements( list ) {
		elements = list;
	}

	bindScrollListener();

	/**
	 * @typedef {Object} SectionObserver
	 * @property {calcIntersection} calcIntersection
	 * @property {pause} pause
	 * @property {resume} resume
	 * @property {unmount} unmount
	 * @property {setElements} setElements
	 */
	return {
		calcIntersection,
		pause,
		resume,
		unmount,
		setElements
	};
}

module.exports = {
	createSectionObserver
};
