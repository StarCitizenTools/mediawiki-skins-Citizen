import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';
import { defineLoader } from 'vitepress';
import { GITHUB_OWNER, GITHUB_REPO } from '../../constants';

const octokit = new Octokit( { auth: process.env.GITHUB_TOKEN } );

type GitHubReleaseList = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.listReleases>;

declare const data: GitHubReleaseList;
export { data };

export default defineLoader( {
	async load(): Promise<GitHubReleaseList> {
		const releases = await octokit.paginate( octokit.repos.listReleases, {
			owner: GITHUB_OWNER,
			repo: GITHUB_REPO,
			// eslint-disable-next-line camelcase
			per_page: 100,
		} );

		return releases;
	},
} );
