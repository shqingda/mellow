import { browser } from 'wxt/browser';

/** The interface's language: by the browser's, or chosen. */
export type LangSetting = 'auto' | 'zh' | 'en';
export type Lang = 'zh' | 'en';

const zh = {
  enable: '启用 Mellow',
  thisPage: '当前页面',
  unavailable: '此页面无法使用 Mellow',
  reloadToApply: '刷新页面后生效',
  detecting: '正在识别',
  darkPage: '深色页面',
  lightPage: '浅色页面',
  off: ' · 已关闭',
  openedBefore: '这个页面在安装或更新插件之前就已打开。',
  reload: '刷新页面',
  thisSite: '此网站',
  modeAuto: '自动',
  modeOn: '始终开启',
  modeOff: '关闭',
  autoHint: '自动：深色页面柔化，浅色页面保持原样。',
  preview: '效果预览',
  before: '原来',
  after: '柔化后',
  sampleText: '正文',
  sampleMuted: '次要文字',
  sampleLink: '链接',
  sampleCode: '代码橙',
  adjust: '调节',
  reset: '恢复默认',
  white: '白字亮度',
  knee: '柔化起点',
  kneeHint: '越高，越只影响最白的字',
  color: '彩色文字',
  colorHint: '链接、代码高亮等',
  shortcut: '在当前网站开启或关闭',
  language: '语言',
  langAuto: '自动',
};

export type Strings = typeof zh;

const en: Strings = {
  enable: 'Turn on Mellow',
  thisPage: 'This page',
  unavailable: 'Mellow can’t run on this page',
  reloadToApply: 'Reload to apply',
  detecting: 'Detecting',
  darkPage: 'Dark page',
  lightPage: 'Light page',
  off: ' · Off',
  openedBefore: 'This page was opened before Mellow was installed or updated.',
  reload: 'Reload',
  thisSite: 'This site',
  modeAuto: 'Auto',
  modeOn: 'Always on',
  modeOff: 'Off',
  autoHint: 'Auto: softens dark pages, leaves light ones.',
  preview: 'Preview',
  before: 'Before',
  after: 'After',
  sampleText: 'Body text',
  sampleMuted: 'Secondary',
  sampleLink: 'Link',
  sampleCode: 'Code orange',
  adjust: 'Adjust',
  reset: 'Reset',
  white: 'White text',
  knee: 'Softening starts',
  kneeHint: 'Higher touches only the whitest text',
  color: 'Colored text',
  colorHint: 'Links, code highlighting',
  shortcut: 'turns it on or off for this site',
  language: 'Language',
  langAuto: 'Auto',
};

/** The language to show: the chosen one, else the browser's own. */
export function resolveLang(setting: LangSetting): Lang {
  if (setting !== 'auto') return setting;
  return browser.i18n.getUILanguage().toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function strings(lang: Lang): Strings {
  return lang === 'zh' ? zh : en;
}
