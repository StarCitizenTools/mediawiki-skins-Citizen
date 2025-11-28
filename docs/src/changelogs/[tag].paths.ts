import { Octokit } from '@octokit/rest';
import { GITHUB_OWNER, GITHUB_REPO } from '../../.vitepress/constants';

export default {
	async paths(): Promise<{ params: { tag: string } }[]> {
		const octokit = new Octokit();
		const releases = await octokit.paginate( octokit.repos.listReleases, {
			owner: GITHUB_OWNER,
			repo: GITHUB_REPO,
			// eslint-disable-next-line camelcase
			per_page: 100,
		} );

		return releases
			.filter( r => !!r.tag_name )
			.map( r => ( { params: { tag: r.tag_name } } ) );
	},
};
