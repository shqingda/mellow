import { describe, expect, it } from 'vitest';
import { DEFAULTS, loadSettings, paramsFor, saveSettings, withSiteMode, withSiteWhite } from './settings';

describe('sites', () => {
  it('take their own white, and the others the shared one', () => {
    const s = withSiteWhite(DEFAULTS, 'a.com', 0.9);
    expect(paramsFor(s, 'a.com').white).toBe(0.9);
    expect(paramsFor(s, 'b.com').white).toBe(DEFAULTS.white);
    expect(withSiteWhite(s, 'a.com', null).whites).toEqual({});
  });
});

describe('storage', () => {
  it('fills in defaults for what was never saved', async () => {
    expect(await loadSettings()).toEqual(DEFAULTS);
    await saveSettings({ ...DEFAULTS, knee: 0.7 });
    expect((await loadSettings()).knee).toBe(0.7);
  });

  it('drops a site back to auto rather than storing it', () => {
    const s = withSiteMode(withSiteMode(DEFAULTS, 'a.com', 'off'), 'a.com', 'auto');
    expect(s.sites).toEqual({});
  });
});
