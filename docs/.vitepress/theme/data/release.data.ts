import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';
import { defineLoader } from 'vitepress';
import { GITHUB_OWNER, GITHUB_REPO } from '../../constants';

const octokit = new Octokit();

type GitHubRelease = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getLatestRelease>;

export interface AppRelease {
	stable: GitHubRelease;
}

declare const data: AppRelease;
export { data };

export default defineLoader( {
	async load(): Promise<AppRelease> {
		const { data: stable } = await octokit.repos.getLatestRelease( {
			owner: GITHUB_OWNER,
			repo: GITHUB_REPO,
		} );

		return { stable };
	},
} );
