import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { type PageState, siteMode, updateSettings, withSiteMode } from '@/lib/settings';

export default defineBackground(() => {
  // The shortcut turns softening off on the site in front if it is on, and
  // on if it is off.
  browser.commands.onCommand.addListener(async (command, tab) => {
    if (command !== 'toggle-site' || !tab?.id || !tab.url) return;
    let host: string;
    try {
      host = new URL(tab.url).hostname;
    } catch {
      return;
    }
    if (!host) return;
    let state: PageState | undefined;
    try {
      state = await browser.tabs.sendMessage(tab.id, { type: 'mlw:state' }, { frameId: 0 });
    } catch {
      // No content script, as on the browser's own pages.
      return;
    }
    await updateSettings((s) => {
      if (state?.active) return withSiteMode(s, host, 'off');
      // Back to automatic when that turns it on, else on outright.
      const mode = siteMode(s, host) === 'off' && state?.dark !== false ? 'auto' : 'on';
      return withSiteMode({ ...s, enabled: true }, host, mode);
    });
  });
});
