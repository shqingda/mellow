# Mellow 1.0.0 Chrome Web Store 上架文案

本页包含可直接填写到 Chrome Web Store 的中英文介绍、权限与隐私说明、审核步骤和版本说明。面向用户的文案按 1.0.0 的实际功能编写；以下字段尚未提交到商店。

## 文件和链接

| 用途 | 文件或地址 |
| --- | --- |
| 上传包 | `.output/mellow-1.0.0-chrome.zip`，运行 `pnpm zip` 生成 |
| 商店图标 | `public/icon/128.png`，128 × 128，四边透明留白 16 px |
| 英文功能截图 | [screenshots/en](screenshots/en)，5 张 1280 × 800 PNG |
| 简体中文功能截图 | [screenshots/zh_CN](screenshots/zh_CN)，5 张 1280 × 800 PNG |
| 项目主页 | https://github.com/shqingda/mellow |
| 支持页面 | https://github.com/shqingda/mellow/issues |
| 隐私政策 URL | https://github.com/shqingda/mellow/blob/main/PRIVACY.md |
| 隐私政策源文件 | [PRIVACY.md](../PRIVACY.md) |

## 基本信息

| 字段 | 填写内容 |
| --- | --- |
| 名称 | Mellow |
| 版本 | 1.0.0 |
| 类型 | Extension |
| 类别 | Accessibility（无障碍） |
| 默认语言 | English（en） |
| 其他语言 | 中文（简体，zh_CN） |
| 价格 | 免费，无应用内购买 |
| 成人内容 | 否 |
| 登录或付费要求 | 无 |
| 建议分发方式 | Public（公开）；地区可沿用后台默认值 |
| 官方已验证网址 | 未验证自有网站时留空，项目主页填写上面的 GitHub 地址 |

名称和简短说明由上传包中的语言文件提供。详细介绍分别填入 English 和中文（简体）对应的商店语言页，避免把两种语言混在同一个描述栏。类别及字段说明见 [Google 商店最佳实践](https://developer.chrome.com/docs/webstore/best-practices)和[商店资料说明](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)。

## 简短说明

与 `public/_locales/` 中的扩展描述一致，两种语言均不超过 132 个字符。

### English

```text
Soften bright text on dark pages. Fine-tune brightness for each site, with all settings stored locally.
```

### 中文（简体）

```text
柔化深色网页上刺眼的亮字，按网站调节亮度，设置仅保存在本机。
```

## 详细介绍

### English

```text
Mellow softens bright text on dark web pages, so you can choose a level of brightness that feels comfortable to read.

If a dark theme still leaves its white text feeling too bright, Mellow lets you turn the text down without changing the page background or images.

MAKE DARK PAGES YOUR OWN
• Automatic mode detects dark pages and applies the adjustment there.
• Set a different white-text brightness for each website.
• Choose Auto, Always on or Off for individual sites, with a global on/off switch.
• Adjust where softening starts and how strongly it affects colored text, including links and code highlighting.
• Compare sample text before and after in the popup.
• Switch the interface between English, Simplified Chinese and your browser's language.
• Toggle the current site with Alt+Shift+M (Option+Shift+M on macOS). Chrome lets you change the shortcut.

LOCAL BY DESIGN
Mellow processes page structure, colors, text-node lengths and the current site's hostname locally to adjust brightness. Your settings and site preferences stay in this browser profile. Page text is not saved or uploaded, and Mellow has no server, analytics, ads, account or subscription.

WHY WEBSITE ACCESS IS NEEDED
Automatic softening needs to inspect page appearance and apply styles as supported pages load. The storage permission remembers your preferences; activeTab lets the popup and keyboard shortcut identify the site you are using.

GETTING STARTED
Install Mellow, reload any pages that were already open, and open a website with a dark theme. Click the Mellow icon to adjust White text. The value is remembered for that site. Use Off to keep a site unchanged, or turn off the global switch to stop softening everywhere.

Requires Chrome 119 or newer. Mellow works with a page's existing colors; it does not turn light websites into dark themes. Chrome's internal pages, the Chrome Web Store, and text inside images or canvas are not supported. SVG icons that inherit the text color can soften along with it. Results can vary with a site's styling, including components that use shadow roots.

Support: https://github.com/shqingda/mellow/issues
Privacy: https://github.com/shqingda/mellow/blob/main/PRIVACY.md
```

### 中文（简体）

```text
Mellow 柔化深色网页上刺眼的亮字，让文字亮度更贴合你的阅读习惯。

如果已经用了深色主题，白字仍然觉得太亮，可以用 Mellow 单独降低文字亮度，保留页面原本的背景和图片。

按自己的习惯调节
• 自动识别深色页面，在深色页面上应用柔化。
• 为每个网站单独保存白字亮度。
• 每个网站可选「自动」「始终开启」「关闭」，也有全局总开关。
• 调节「柔化起点」，决定从多亮的文字开始柔化。
• 单独调节彩色文字的柔化程度，包括链接和代码高亮。
• 在弹窗中对照原来与柔化后的示例文字。
• 界面支持简体中文、英文，也可跟随浏览器语言。
• 用 Alt+Shift+M 切换当前网站的柔化状态；macOS 上为 Option+Shift+M。快捷键可在 Chrome 中修改。

数据留在本机
Mellow 在本机读取页面结构、颜色、文字节点长度和当前网站域名，用于计算文字亮度。设置和网站偏好只保存在当前浏览器配置中；网页正文不会保存或上传。扩展没有服务器、统计、广告、账号或订阅。

为什么需要网站访问权限
为了在页面加载时自动生效，Mellow 需要读取支持页面的外观并应用样式。storage 权限用于记住设置；activeTab 用于让弹窗和快捷键识别当前操作的网站。

开始使用
安装后，刷新之前已经打开的页面，再打开一个使用深色主题的网站。点击 Mellow 图标，调节「白字亮度」，设置会为该网站保存。某个网站不需要柔化时，选择「关闭」；也可以用总开关停止所有网站上的柔化。

需要 Chrome 119 或更新版本。Mellow 根据网页已有的颜色调节文字，不会把浅色网站转换成深色主题。不支持 Chrome 内部页面、Chrome 应用商店，以及图片和画布中的文字。跟随文字颜色的 SVG 图标也可能一起柔化；实际效果取决于网站样式，使用 Shadow DOM 的组件也可能影响适配。

问题反馈：https://github.com/shqingda/mellow/issues
隐私政策：https://github.com/shqingda/mellow/blob/main/PRIVACY.md
```

## 隐私实践

以下英文可用于审核字段，中文用于对应语言的说明。权限以构建包的 `manifest.json` 为准；`<all_urls>` 位于 `content_scripts.matches`，不是额外申请的 `tabs`、`history` 或 `scripting` 权限。Google 要求说明[单一用途、权限理由和数据使用方式](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)。

### 单一用途 Single purpose

```text
Mellow lets users adjust the brightness of text on dark web pages, with automatic dark-page detection and per-site brightness preferences.
```

```text
Mellow 用于调节深色网页的文字亮度，支持自动识别深色页面并按网站保存亮度偏好。
```

### storage 权限理由

```text
The storage permission saves the user's enable/disable setting, language, brightness parameters, per-site modes and per-site brightness overrides in chrome.storage.local. Site hostnames are used as preference keys. Settings remain in the local browser profile, are not synced through a browser account, and are not sent to any server.
```

```text
storage 用于在 chrome.storage.local 中保存总开关、语言、亮度参数、网站模式和各网站的亮度设置。网站域名仅作为偏好索引。设置保留在当前浏览器本地配置中，不通过浏览器账号同步，也不上传服务器。
```

### activeTab 权限理由

```text
When the user clicks the extension or invokes its keyboard shortcut, activeTab lets Mellow read the active tab's URL to identify the current site or determine whether the page is supported. This directs the popup controls and keyboard toggle to the intended site. Mellow does not save full URLs or use the history API.
```

```text
用户点击扩展或使用快捷键后，activeTab 让 Mellow 读取当前标签页的 URL，用于识别当前网站或判断页面是否支持，确保弹窗和快捷键操作作用于正确的网站。Mellow 不保存完整 URL，也不使用历史记录接口。
```

### 网站访问权限理由 Host access

```text
The content script matches <all_urls> so automatic text softening can run at document_start on supported websites and their frames. It reads page structure, computed colors and text-node lengths locally, then applies text-color styles based on the user's preferences. A fixed list of domains would prevent the user from using the extension on other dark-themed sites; requiring a click on every page would prevent automatic application at page load. Page content is not stored or transmitted. Users can disable softening per site or restrict site access in Chrome.
```

```text
内容脚本匹配 <all_urls>，使文字柔化能在支持的网站及其内嵌框架加载时自动运行。扩展在本机读取页面结构、计算颜色和文字节点长度，然后根据用户偏好应用文字颜色样式。固定域名列表无法覆盖用户选择的其他深色网站；每次手动点击也无法在页面加载时自动生效。网页内容不会保存或上传。用户可按网站关闭柔化，也可在 Chrome 中限制网站访问权限。
```

### 远程代码 Remote code

选择 **No, I am not using remote code**。如果后台提供补充说明栏，可填：

```text
All executable JavaScript, CSS and runtime dependencies are bundled in the extension ZIP. Mellow does not download or execute remote code, use a remote configuration service, or make network requests.
```

### 数据使用披露

本机处理也需要披露，不能因为“不上传”就填写为“完全不处理用户数据”。以下选择根据 1.0.0 实际处理的范围及 [Google 用户数据 FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)整理；后台可能将域名或 URL 列入 **Web history**。

| 数据类型 | 填写依据 |
| --- | --- |
| Website content（网站内容） | 勾选：在本机读取 DOM、文字节点长度和计算样式，仅用于外观与亮度处理；不保存正文或上传 |
| Web history（网络记录／浏览历史） | 勾选：使用当前 URL／域名，并保存用户主动设置的网站域名；不读取历史记录数据库，不记录访问时间或访问轨迹 |
| 其他类型 | 不勾选：本版本没有身份、健康、支付、认证、位置、通信或用户活动分析功能，也不专门提取这些信息 |

如果后台提供额外说明栏，填写：

```text
Website content and current-site information are processed only on the user's device to detect dark pages and adjust text brightness. Mellow reads text nodes to count their length but does not save their text. Hostnames are stored only as keys for site preferences the user changes; full URLs, page titles and visit times are not stored. The extension sends no data to the developer or third parties and does not keep a browsing log. All settings use chrome.storage.local, not sync storage.
```

数据用途的三项认证按本版本实际行为均可勾选：不出售或转移用户数据；不将数据用于与单一用途无关的目的；不用于信用评估或借贷。填写上面的公开隐私政策 URL，并使其与这些披露保持一致。

## 审核测试说明 Test instructions

不需要账号、密码、付费订阅或测试凭据。审核员说明可直接填写：

```text
No account, credentials or subscription are required. Use Chrome 119 or later.

1. Install Mellow and reload a normal HTTPS page that has a dark theme with bright text. If the page offers a theme selector, select its dark theme. Chrome internal pages and the Chrome Web Store cannot be used as test pages.
2. Open the Mellow popup. Auto is the default site mode. The status should identify the page as dark, and the popup shows before/after text samples.
3. Move White text and confirm that the page's bright text changes while its background and images remain unchanged. Reload the page or reopen the popup and confirm that the site's brightness setting is retained.
4. Adjust Softening starts and Colored text. Confirm the sample preview updates. SVG icons that inherit the text color may also soften.
5. Select Off for this site and confirm that the text adjustment is removed. Select Always on or Auto to enable it again. The global switch stops or resumes softening across sites.
6. On a light-themed page, Auto should leave its text unchanged. Switching a website from a light to a dark theme should trigger automatic detection.
7. Test Alt+Shift+M, or Option+Shift+M on macOS, to toggle softening for the active site. If another extension uses this shortcut, assign a free shortcut in chrome://extensions/shortcuts.
8. Switch Language between English and Chinese. Reset removes the current site's brightness override and restores the shared softening parameters; it does not erase other sites' preferences or the language setting.

All page analysis and preference storage are local. The extension makes no network requests and has no remote executable code. Full privacy policy: https://github.com/shqingda/mellow/blob/main/PRIVACY.md
```

## 1.0.0 版本说明

适用于商店详细介绍中的版本记录或发布说明。

### English

```text
Mellow 1.0.0 — first stable release
• Automatic text softening for dark web pages.
• Per-site brightness settings and Auto / Always on / Off modes.
• Controls for the softening threshold and colored text, with a before/after sample preview.
• English and Simplified Chinese interface, plus a keyboard shortcut for the current site.
• New terracotta Mellow icon and local-only preferences.
```

### 中文（简体）

```text
Mellow 1.0.0 — 首个正式版本
• 自动识别深色网页并柔化亮字。
• 按网站保存亮度，支持自动、始终开启和关闭。
• 可调节柔化起点和彩色文字，并提供前后效果示例。
• 支持简体中文、英文和当前网站切换快捷键。
• 全新陶土色 Mellow 图标，设置仅保存在本机。
```

## 截图配文

中英文各 5 张功能截图已完成，全部为 1280 × 800 PNG，按文件编号顺序上传。截图取自 Mellow 1.0.0 在本地示例网页上的实际运行画面，配有标题排版，不包含个人浏览内容。

Localized screenshots 对应后台顶部选中的语言；Global screenshots 是各语言共用的素材。可以将英文截图放入 Global，在简体中文页面的 Localized 上传中文截图。两组都提供时，本地化截图排在全局截图前面，英文 Localized 无需再重复同一套图片。显示顺序见 [Google 商店资料说明](https://developer.chrome.com/docs/webstore/cws-dashboard-listing#order_of_graphic_assets)。

宣传图可选，小图 440 × 280，大图 1400 × 560；具体格式见 [Google 图片规范](https://developer.chrome.com/docs/webstore/images)。

| 画面 | 中文标题 | English title |
| --- | --- | --- |
| 同一深色页面的开启前后对比 | 深色页面，文字柔和一点 | Dark pages. Softer text. |
| 按网站保存白字亮度 | 每个网站，都有适合的亮度 | Your brightness. For each site. |
| 自动识别深色与浅色页面 | 深色页面，自动柔化 | Dark pages only. Automatically. |
| 彩色文字调节和预览 | 彩色文字，也能单独调节 | Fine-tune colored text. |
| 明暗界面和中英文语言 | 明暗之间，使用自如 | At home in light and dark. |

## 上传顺序

1. 运行 `pnpm test`、`pnpm typecheck`、`pnpm zip`，上传 `.output/mellow-1.0.0-chrome.zip`。
2. 核对后台版本为 1.0.0；填写中英文详细介绍、类别、主页和支持链接，上传图标及实际功能截图。
3. 填写单一用途、权限理由、远程代码、数据使用和隐私政策 URL。
4. 填入审核测试步骤，设置可见性和分发地区，检查后提交审核。步骤依据 [Google 发布流程](https://developer.chrome.com/docs/webstore/publish)。
