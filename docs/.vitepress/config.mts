import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Citizen",
  description: "Documentation for Citizen Skin",
  srcDir: 'src',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/StarCitizenTools/mediawiki-skins-Citizen' },
      { icon: 'discord', link: 'https://discord.gg/XcKwqyD4sc' }
    ]
  }
})
