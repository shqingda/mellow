import { defineConfig } from 'wxt';

export default defineConfig({
  imports: false,
  // Preact renders the popup: a tenth of React's size, so it opens sooner.
  vite: () => ({
    oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  }),
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['storage', 'activeTab'],
    commands: {
      'toggle-site': {
        suggested_key: { default: 'Alt+Shift+M', mac: 'Alt+Shift+M' },
        description: '__MSG_toggleSite__',
      },
    },
  },
});
