export const CONTRIBUTORS_REGEX = /(?<=\(|, |by |and |^(\*|-) )@([a-zA-Z0-9-]+)(?=\)|, | and | made their first contribution)/gm;

export function extractContributors( text: string ): string[] {
	const matches = text.matchAll( CONTRIBUTORS_REGEX );
	const contributors = [ ...matches ].map( match => match[ 2 ] );
	return [ ...new Set( contributors ) ];
}

export function linkContributors( text: string ): string {
	return text.replace( CONTRIBUTORS_REGEX, '[@$2](https://github.com/$2)' );
}
