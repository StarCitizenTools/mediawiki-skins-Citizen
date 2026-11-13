import { Octokit } from "@octokit/rest";

/**
 * Build-time GitHub client; never import it from client code.
 *
 * Without a token, requests share a 60-per-hour budget per IP, and CI runners
 * share IPs with other jobs, so builds would fail at random. The token is
 * optional so local builds still work without one.
 */
export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
