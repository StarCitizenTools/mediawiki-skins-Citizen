import type MarkdownIt from 'markdown-it';
import { GITHUB_OWNER, GITHUB_REPO } from '../../constants';
import { linkContributors } from './contributors';

function removeVersionHeader( input: string ): string {
	// eslint-disable-next-line security/detect-unsafe-regex
	return input.replace( /^\s*##\s+\[.*?\]\(.*?\)(?:\s+\(.*\))?\s*(\r?\n)+/, '' );
}

function downgradeHeadings( input: string ): string {
	return input.replace( /^(#+)/gm, '$1#' );
}

function formatCommitLinks( input: string ): string {
	return input
		.replace( /\(\[([0-9a-f]{7})\]\((.*?)\)\)/g, '[$1]($2)' )
		.replace( /\[([0-9a-f]{7})\]\((.*?)\)/g, '[`$1`]($2)' );
}

function formatPRLinks( input: string ): string {
	const repoUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
	// eslint-disable-next-line security/detect-non-literal-regexp
	const prRegex = new RegExp( `(?<!\\]\\()${repoUrl}/(pull|issues)/(\\d+)`, 'g' );
	return input.replace( prRegex, '[#$2]($&)' );
}

function formatFullChangelogLink( input: string ): string {
	return input.replace( /\*\*Full Changelog\*\*: (https:\/\/\S+)/g, '[See all commits]($1)' );
}

export function formatChangelog(
	md: MarkdownIt,
	body: string | null | undefined,
): string {
	let text = body ?? 'No changelog provided.';

	text = removeVersionHeader( text );
	text = downgradeHeadings( text );
	text = linkContributors( text );
	text = formatCommitLinks( text );
	text = formatPRLinks( text );
	text = formatFullChangelogLink( text );

	return md.render( text.trim() );
}
