import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { defineLoader } from "vitepress";
import { GITHUB_OWNER, GITHUB_REPO } from "../../constants.ts";
import { octokit } from "../../github.ts";

type GitHubRelease = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getLatestRelease>;

export interface AppRelease {
	stable: GitHubRelease;
}

declare const data: AppRelease;
export { data };

export default defineLoader({
	async load(): Promise<AppRelease> {
		const { data: stable } = await octokit.repos.getLatestRelease({
			owner: GITHUB_OWNER,
			repo: GITHUB_REPO,
		});

		return { stable };
	},
});
