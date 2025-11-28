---
title: Latest Changelog
description: Changelog of the latest version of Citizen.
outline: false
lastUpdated: false
editLink: false
---

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { Octokit } from '@octokit/rest'
import { GITHUB_OWNER, GITHUB_REPO } from '../../.vitepress/constants'

const router = useRouter()

onMounted(async () => {
  try {
    const octokit = new Octokit( { auth: import.meta.env.GITHUB_TOKEN } )
    const { data } = await octokit.repos.listReleases({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      per_page: 1,
    })

    if (data && data.length > 0 && data[0].tag_name) {
      const latestTag = data[0].tag_name
      router.go(withBase(`/changelogs/${latestTag}`))
    } else {
      // Fallback to changelogs index if no releases found
      router.go(withBase('/changelogs/'))
    }
  } catch (error) {
    console.error('Failed to fetch latest release:', error)
    // Fallback to changelogs index on error
    router.go(withBase('/changelogs/'))
  }
})
</script>

<div style="text-align: center; padding: 2rem;">
  <p>Redirecting to the latest changelog...</p>
</div>
