/** The complete tag vocabulary. Slug to chip label. */
export const SHOWCASE_TAGS = {
	games: "Games",
	media: "Media",
	technology: "Technology",
	"real-world": "Real world",
} as const;

export type ShowcaseTag = keyof typeof SHOWCASE_TAGS;

export interface ShowcaseSource {
	name: string;
	url: string;
	tags: string[];
	expectUnreachable?: boolean;
}

export interface ShowcaseMetadata {
	articles?: number;
	lang?: string;
	generator?: string;
}

export interface ShowcaseShot {
	shot?: string;
	shotW?: number;
	shotH?: number;
}

export interface ShowcaseEntry extends ShowcaseMetadata, ShowcaseShot {
	name: string;
	url: string;
	tags: ShowcaseTag[];
}

const SCALES: [number, string][] = [
	[1_000_000_000, "B"],
	[1_000_000, "M"],
	[1000, "K"],
];

/**
 * Formats an article count for display.
 *
 * Counts are rounded DOWN to two significant figures and suffixed with "+", so
 * a value published today stays true as the wiki grows. Rounding up, or showing
 * the exact figure, would be false within hours.
 */
export function formatArticleCount(count: number): string {
	for (const [divisor, suffix] of SCALES) {
		if (count >= divisor) {
			const scaled = count / divisor,
				truncated = scaled >= 10 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10;

			return `${truncated}${suffix}+ articles`;
		}
	}

	// Below the smallest scale, where an exact figure is short enough to read.
	return `${count} articles`;
}

/** "MediaWiki 1.46.0" to "MW 1.46". Undefined for anything else. */
export function formatGenerator(generator?: string): string | undefined {
	const match = /^MediaWiki (\d+\.\d+)/.exec(generator ?? "");

	return match ? `MW ${match[1]}` : undefined;
}

const CJK = /[㐀-鿿豈-﫿]/,
	NOISE_WORDS = /^(the|official|wiki)$/i;

/** Initials for the fallback tile shown when a wiki has no screenshot yet. */
export function monogramFor(name: string): string {
	if (CJK.test(name)) {
		// An ideograph outside the BMP is one code point but two code units, so `name[0]` would return half of it.
		const first = name.codePointAt(0);

		return first === undefined ? "?" : String.fromCodePoint(first);
	}

	const words = name.split(/\s+/).filter((word) => word && !NOISE_WORDS.test(word));

	if (words.length === 0) {
		return name.slice(0, 2).toUpperCase();
	}

	if (words.length === 1) {
		return words[0].slice(0, 2).toUpperCase();
	}

	return (words[0][0] + words[1][0]).toUpperCase();
}

function assertKnownTags(
	entry: ShowcaseSource,
): asserts entry is ShowcaseSource & { tags: ShowcaseTag[] } {
	for (const tag of entry.tags) {
		if (!(tag in SHOWCASE_TAGS)) {
			throw new Error(
				`showcase.json: "${entry.name}" has unknown tag "${tag}". Allowed tags: ${Object.keys(SHOWCASE_TAGS).join(", ")}`,
			);
		}
	}
}

/**
 * Joins the hand-maintained list with the two generated files.
 *
 * Generated records are keyed by URL and may be absent — a wiki added since the
 * last capture run has neither. Missing fields stay undefined and the component
 * degrades rather than rendering blanks.
 */
export function joinShowcase(
	sources: ShowcaseSource[],
	metadata: Record<string, ShowcaseMetadata>,
	shots: Record<string, ShowcaseShot>,
): ShowcaseEntry[] {
	const joined = sources.map((source): ShowcaseEntry => {
		assertKnownTags(source);

		const meta = metadata[source.url],
			shot = shots[source.url];

		return {
			name: source.name,
			url: source.url,
			tags: source.tags,
			articles: meta?.articles,
			lang: meta?.lang,
			generator: meta?.generator,
			shot: shot?.shot,
			shotW: shot?.shotW,
			shotH: shot?.shotH,
		};
	});

	// Largest first makes the scale argument immediately; uncounted wikis sort last.
	return joined.toSorted((a, b) => (b.articles ?? -1) - (a.articles ?? -1));
}
