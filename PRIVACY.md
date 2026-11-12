# Mellow Privacy Policy

Effective date: November 12, 2026 · Applies to Mellow 1.0.0

Mellow adjusts the brightness of text on web pages. It processes information locally in your browser, has no server, and sends no page content, browsing information or settings to the developer or third parties. It has no analytics, advertising or account system.

## Information used on your device

- **Page appearance and text nodes.** Mellow reads the page structure, computed text and background colors, and text-node lengths to detect dark pages, estimate the main text's brightness and apply the adjustment. Reading text-node lengths involves accessing the nodes' text locally. Mellow does not save page text, create screenshots or transmit page content.
- **The current site.** Mellow reads the current page's hostname to apply your site preferences. When you open the popup or use its keyboard shortcut, it also uses the active tab's URL to identify the site or determine whether the page is supported. Full URLs, page titles and visit times are not saved. Hostnames are saved only as keys for site preferences you change; Mellow does not keep a log of visited pages.
- **Your preferences.** Mellow stores the on/off setting, language, brightness controls, site modes and per-site brightness overrides in `chrome.storage.local`. These settings stay in the local browser profile and are not synced through your browser account.

Page appearance calculations and sampled text are used in memory, not written to persistent storage. Page state sent between the content script and popup stays within the extension in your browser.

## Permissions

- **Website access (`<all_urls>` in the content-script declaration)** lets Mellow adjust text automatically as supported pages load, including their frames. It is used to inspect appearance and apply local styles. Browser-protected pages, such as `chrome://` pages and the Chrome Web Store, are not supported.
- **`activeTab`** lets Mellow identify the current page after you click the extension or use its keyboard shortcut, so its controls act on that site.
- **`storage`** saves and reads your preferences locally.

Mellow does not use the browser's history API, read cookies, record keystrokes or inspect password input values. It does not request access to your camera, microphone or location.

## Network requests and sharing

Mellow itself makes no network requests, loads no remote executable code and does not upload, sell or share user data. It uses locally processed information only to provide its text-brightness controls. Websites you visit and Chrome's own services operate independently under their own privacy policies.

## Control and deletion

You can turn softening off globally or for an individual site, and restrict site access in Chrome's extension settings. Turning softening off removes the text adjustment but keeps preferences and can leave local appearance checks running. To stop page scripts on an already open page, disable Mellow or revoke its site access in Chrome, then reload that page.

Selecting **Auto** removes that site's explicit mode override. **Reset** removes the current site's brightness override and resets the shared softening controls; it does not erase other sites' preferences or your language setting. Preferences remain in the local profile until changed or the extension is uninstalled. Uninstalling Mellow removes its extension storage.

## Contact

Questions about Mellow or this policy can be submitted through [GitHub Issues](https://github.com/shqingda/mellow/issues). Issues are public: include only information you choose to share. Information you voluntarily post there is handled by GitHub and is separate from the extension's local processing.

---

# Mellow 隐私政策

生效日期：2026 年 11 月 12 日 · 适用于 Mellow 1.0.0

Mellow 用于调节网页文字亮度。所有处理都在浏览器本机完成，扩展没有自己的服务器，不向开发者或第三方发送网页内容、浏览信息或设置。扩展没有统计、广告或账号系统。

## 在本机使用的信息

- **页面外观和文字节点。** Mellow 读取页面结构、文字和背景的计算颜色，以及文字节点的长度，用于识别深色页面、估算主要文字的亮度并应用调整。计算文字长度时会在本机访问节点里的文字，但不会保存正文、截取页面图片或上传网页内容。
- **当前网站。** Mellow 读取当前页面的域名，以应用对应的网站设置。打开弹窗或使用快捷键时，也会使用当前标签页的 URL 来识别网站或判断页面是否支持。扩展不保存完整 URL、页面标题或访问时间；只有你修改网站偏好时，才把域名作为该项偏好的索引保存，不会建立访问记录。
- **个人设置。** 总开关、语言、亮度参数、网站模式和各网站的亮度设置保存在 `chrome.storage.local`，仅留在当前浏览器的本地配置中，不通过浏览器账号同步。

页面外观计算和取样文字只用于内存中的处理，不写入持久存储。内容脚本与弹窗之间传递的页面状态也只在本机扩展内部流转。

## 权限用途

- **网站访问权限（内容脚本声明中的 `<all_urls>`）**：在支持的页面及其内嵌框架加载时，自动读取外观并应用文字样式。不支持 `chrome://` 页面、Chrome 应用商店等浏览器保护的页面。
- **`activeTab`**：在你点击扩展或使用快捷键后，识别当前页面，让操作作用于对应网站。
- **`storage`**：在本机读取和保存设置。

Mellow 不使用浏览器历史记录接口，不读取 Cookie，不记录按键或读取密码输入框的值，也不请求摄像头、麦克风或定位权限。

## 网络请求和共享

Mellow 本身不发起网络请求、不加载远程可执行代码，也不上传、出售或共享用户数据。本机处理的信息仅用于文字亮度调节。你访问的网站和 Chrome 自身的服务独立运行，适用各自的隐私政策。

## 控制和删除

你可以全局关闭柔化、关闭某个网站上的柔化，或在 Chrome 扩展设置中限制网站访问权限。关闭柔化会停止应用文字调整，但会保留偏好，部分本机外观检查仍可能运行。如果要停止已经打开的页面中的扩展脚本，请在 Chrome 中停用 Mellow 或撤销该网站的访问权限，然后刷新页面。

选择「自动」会删除当前网站的模式覆盖；「恢复默认」会删除当前网站的自定义亮度并重置共用的柔化参数，不会清除其他网站的设置或语言选择。设置会留在本地配置中，直到你修改或卸载扩展。卸载 Mellow 会删除其扩展存储数据。

## 联系方式

关于 Mellow 或本政策的问题，可通过 [GitHub Issues](https://github.com/shqingda/mellow/issues) 提交。Issue 内容公开，请只填写你愿意公开的信息；主动发布到 GitHub 的内容由 GitHub 处理，与扩展在本机进行的处理相互独立。
