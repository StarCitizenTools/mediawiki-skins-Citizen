import type MarkdownIt from 'markdown-it';
import { GITHUB_OWNER, GITHUB_REPO } from '../../constants';
import { linkContributors } from './contributors';

function removeVersionHeader( input: string ): string {
	return input.replace( /^\s*##\s+\[.*?\]\(.*?\)(?:\s+\(.*\))?\s*(\r?\n)+/, '' );
}

function downgradeHeadings( input: string ): string {
	return input.replaceAll( /^(#+)/gm, '$1#' );
}

function formatCommitLinks( input: string ): string {
	return input
		.replaceAll( /\(\[([0-9a-f]{7})\]\((.*?)\)\)/g, '[$1]($2)' )
		.replaceAll( /\[([0-9a-f]{7})\]\((.*?)\)/g, '[`$1`]($2)' );
}

function formatCVELinks( input: string ): string {

	return input.replaceAll( /(?<!\[)`?CVE-(\d{4})-(\d+)`?(?!\])/g, '[`CVE-$1-$2`](https://www.cve.org/CVERecord?id=CVE-$1-$2)' );
}

function formatPRLinks( input: string ): string {
	const repoUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
	const prRegex = new RegExp( `(?<!\\]\\()${repoUrl}/(pull|issues)/(\\d+)`, 'g' );
	return input.replaceAll( prRegex, '[#$2]($&)' );
}

function formatFullChangelogLink( input: string ): string {
	return input.replaceAll( /\*\*Full Changelog\*\*: (https:\/\/\S+)/g, '[See all commits]($1)' );
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
	text = formatCVELinks( text );
	text = formatPRLinks( text );
	text = formatFullChangelogLink( text );

	return md.render( text.trim() );
}
