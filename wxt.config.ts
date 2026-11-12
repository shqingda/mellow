import { defineConfig } from 'wxt';

export default defineConfig({
  imports: false,
  // Only the popup loads React; content scripts stay framework-free.
  vite: () => ({
    oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
    // Browsers supporting Mellow's relative colors already support modulepreload.
    build: { modulePreload: { polyfill: false } },
  }),
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    homepage_url: 'https://github.com/shqingda/mellow',
    minimum_chrome_version: '119',
    permissions: ['storage', 'activeTab'],
    commands: {
      'toggle-site': {
        suggested_key: { default: 'Alt+Shift+M', mac: 'Alt+Shift+M' },
        description: '__MSG_toggleSite__',
      },
    },
  },
});
