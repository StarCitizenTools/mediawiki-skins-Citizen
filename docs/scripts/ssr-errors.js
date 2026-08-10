/**
 * `vitepress build` exits 0 even when a page throws during server-side
 * rendering: it logs the error, emits the page without the failed component and
 * reports success. A broken docs site therefore ships behind a green CI run.
 * These matchers let the build wrapper turn such a log into a non-zero exit.
 */

/** Uncaught error header, e.g. `TypeError: Cannot read properties of undefined`. */
const ERROR_HEADER = /^(?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*(?:Error|Exception):\s+\S/;

/** Stack frame from Vue's SSR renderer, present even when the header is unusual. */
const SSR_FRAME =
	/^\s+at\s+.*(?:server-renderer|ssrRenderComponent|renderComponentVNode|_sfc_ssrRender)/;

/** ANSI SGR sequences, stripped so coloured output still matches the patterns above. */
const ANSI = /\u001B\[[0-9;]*m/g;

/**
 * Finds log lines that indicate a server-side render failure.
 *
 * @param {string} log Combined stdout and stderr of a `vitepress build` run.
 * @returns {{ line: number, text: string }[]} One entry per offending line, with its 1-based line number.
 */
export function findSsrErrors(log) {
	/** @type {{ line: number, text: string }[]} */
	const hits = [];

	log.split(/\r?\n/).forEach((text, index) => {
		const plain = text.replace(ANSI, "");

		if (ERROR_HEADER.test(plain) || SSR_FRAME.test(plain)) {
			hits.push({ line: index + 1, text: plain });
		}
	});

	return hits;
}
