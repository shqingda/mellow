# Mellow 里的算法

这份笔记把 Mellow 源码里用到的算法逐个拆开讲，并给出可以对照练习的 LeetCode 题。每一节的结构都一样：**它在做什么 → 代码 → 复杂度 → 对应的题**。

目录：

1. [加权多数与加权中位数](#1-加权多数与加权中位数)：`lib/detect.ts`
2. [沿父指针向上查找](#2-沿父指针向上查找)：`lib/detect.ts`
3. [二分答案](#3-二分答案)：`lib/fade.ts`
4. [复合函数求逆：把嵌套二分变成一次](#4-复合函数求逆把嵌套二分变成一次)：`lib/fade.ts`（思路，未改代码）
5. [无栈前序遍历与剪枝](#5-无栈前序遍历与剪枝)：`lib/keep.ts`
6. [子树去重：删除子文件夹](#6-子树去重删除子文件夹)：`lib/keep.ts`（**本次修改**）
7. [按批处理的去重队列](#7-按批处理的去重队列)：`lib/frame.ts`
8. [两级哈希计数](#8-两级哈希计数)：`lib/text.ts`
9. [节流与先到先得](#9-节流与先到先得)：`entrypoints/content.ts`
10. [位运算与矩阵乘法](#10-位运算与矩阵乘法)：`lib/color.ts`
11. [推公式求反函数](#11-推公式求反函数)：`lib/curve.ts`

最后一节 [嵌套循环 ≠ O(n²)](#嵌套循环--on) 汇总了项目里所有嵌套循环的分析。

---

## 1. 加权多数与加权中位数

**在做什么。** 判断页面是暗色还是亮色，并估计页面主背景的亮度。做法是在视口上取 5×5 = 25 个采样点，读出每个点下面的背景亮度。中间 3×3 的点权重为 2（正文通常在中间），四周的点权重为 1。

- **是不是暗色**：加权多数。暗色点的权重之和 ≥ 总权重的一半，就判为暗色。
- **主背景亮度**：加权中位数。按亮度排序后，从小到大累加权重，第一个让累计权重达到一半的样本就是答案。

```ts
const total = samples.reduce((n, s) => n + s.weight, 0);
const dark = samples.filter((s) => s.l < DARK_BELOW).reduce((n, s) => n + s.weight, 0);
samples.sort((a, b) => a.l - b.l);
let acc = 0;
let bg = samples[samples.length - 1].l;
for (const s of samples) {
  acc += s.weight;
  if (acc >= total / 2) {
    bg = s.l;
    break;
  }
}
```

**为什么用中位数而不用平均数。** 一张深色页面上有一块白色卡片时，平均数会被白卡片拉高，中位数不会。中位数对离群值更稳健。

**复杂度。** 排序 O(n log n)，扫描 O(n)。n 固定为 25，所以实际上是常数。加权中位数也可以像快速选择那样做到 O(n)，但 n = 25 时没有意义。

**对应的题。**

- 2448 使数组相等的最小开销：加权中位数的标准题。
- 462 最小操作次数使数组元素相等 II：不带权的中位数。
- 296 最佳的碰头地点：二维中位数，每一维分开取。
- 169 多数元素：多数投票。

---

## 2. 沿父指针向上查找

**在做什么。** 给定一个元素，找它实际显示的背景色：从它自己开始，沿 `parentElement` 一路向上，找到第一个不透明的背景。

```ts
for (let e = el; e; e = e.parentElement) {
  const cs = getComputedStyle(e);
  const c = parseColor(cs.backgroundColor);
  if (c) return c.l;
  // ...
}
return canvas;
```

**复杂度。** O(d)，d 是 DOM 深度。25 个采样点合计 O(25·d)。

**可以优化但不必要。** 多个采样点经常共享祖先，可以用 `Map<Element, number | null>` 把结果缓存起来（记忆化），每个元素只读一次 `getComputedStyle`。不过每 1.5 秒才看一次页面，收益很小。

**对应的题。**

- 1650 二叉树的最近公共祖先 III：节点带父指针，向上走。
- 记忆化的思路见 70 爬楼梯、337 打家劫舍 III。

---

## 3. 二分答案

**在做什么。** 淡入淡出动画用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动。贝塞尔曲线是参数形式：给定参数 t，可以算出 x(t) 和 y(t)；但我们手上是 x（时间进度），要的是 y。由于 x(t) 在 [0, 1] 上单调递增，可以二分出满足 x(t) = 目标值的 t。

```ts
function solve(f: (t: number) => number, y: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
```

**要点。**

- **前提是单调。** 二分答案的本质是：答案空间上有一个单调的判定函数。
- **浮点二分用固定迭代次数，不用 `while (hi - lo > eps)`。** 每次区间减半，24 次后区间宽度是 2⁻²⁴ ≈ 6×10⁻⁸，足够精确；而且固定次数不会因为浮点误差陷入死循环。

**复杂度。** O(k)，k = 24。

**对应的题。**

- 69 x 的平方根：最基础的“在单调函数上二分”。
- 875 爱吃香蕉的珂珂、1011 在 D 天内送达包裹的能力、410 分割数组的最大值：整数版“二分答案”。
- 1201 丑数 III：二分 + 单调计数函数。

---

## 4. 复合函数求逆：把嵌套二分变成一次

> 这一节是**思路讲解**，代码没有改。

**现状。** `ease(p)` 内部做一次二分（求 x⁻¹），而生成关键帧时又要对 `ease` 本身二分求逆：

```ts
export function ease(p: number): number {
  return bezier(solve((t) => bezier(t, 0.4, 0.2), p), 0, 1); // 一次二分
}

for (let i = 1; i <= steps; i++) {
  frames.push({ offset: solve(ease, (i - 0.5) / steps), ... }); // 二分里套二分
}
```

所以是三层循环：12 步 × 外层二分 24 次 × 内层二分 24 次，再加上每次 `ease` 里最后那次求 y。实测一次淡入淡出共计算 bezier **7200 次**。

**观察。** 记 X(t) 是 x 坐标，Y(t) 是 y 坐标，两者都单调，那么：

```
ease = Y ∘ X⁻¹
ease⁻¹ = (Y ∘ X⁻¹)⁻¹ = X ∘ Y⁻¹
```

也就是说，要求 ease(p) = y 的 p，只需先二分出 Y(t) = y 的 t，再算 p = X(t)。**一次二分就够了**：

```ts
const offset = bezier(solve((t) => bezier(t, 0, 1), y), 0.4, 0.2);
```

实测只需 **300 次**求值，结果与原方法相差不到 10⁻⁷。

**更进一步：闭式解。** 这里 Y(t) = 3t² − 2t³，正好是图形学里的 smoothstep，它的反函数有闭式解：

```
t = 0.5 − sin(asin(1 − 2y) / 3)
```

**为什么没改。** 7200 次乘加只要几微秒，而且只在开关时跑一次。原来的 `solve(ease, …)` 一眼就能看懂“对 ease 求逆”，可读性更好。这一节值得带走的是**思路**：先看清结构，再决定要不要搜索。

**对应的题。** 这类“换个方向求解”的思路在下面这些题里都会用到：

- 4 寻找两个正序数组的中位数：二分的对象不是值，而是切分位置。
- 1482 制作 m 束花所需的最少天数：把“求天数”转成“判定某天够不够”。

---

## 5. 无栈前序遍历与剪枝

**在做什么。** 给一棵 DOM 子树里的每个元素打标记（文字是否保留原色）。用的是浏览器的 `TreeWalker`：

```ts
const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
  acceptNode: (n) => (skipped(n as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
});
while (walker.nextNode()) mark(walker.currentNode as Element);
```

**两个知识点。**

1. **无栈的前序遍历。** `nextNode()` 不需要显式的栈或递归：有第一个子节点就去子节点；没有就去下一个兄弟；兄弟也没有就沿父指针往上，找祖先的下一个兄弟。这正是“借父指针求前序后继”。
2. **剪枝。** `FILTER_REJECT` 会跳过整棵子树（`svg` 图标的所有路径、`script` 等），`FILTER_SKIP` 则只跳过节点本身、仍然访问它的子节点。一个信息流页面里大量的图标就这样被整块剪掉。

**复杂度。** O(子树大小)，被剪掉的部分不计。

**对应的题。**

- 144 二叉树的前序遍历：要求用迭代写。
- 510 二叉搜索树中的中序后继 II：只有父指针，求后继，与 `nextNode()` 同理。
- 116/117 填充每个节点的下一个右侧节点指针：借助已有指针省掉队列。
- 814 二叉树剪枝。

---

## 6. 子树去重：删除子文件夹

> **本次修改。** 文件：`lib/keep.ts` 的 `watchAdded`。

**背景。** 页面新增元素时，`MutationObserver` 把它们收集进一个 Set `added`，等到下一帧再统一调用 `markTree`，标记每个新元素及其子树。

**问题。** 如果父元素和它的子元素都在 `added` 里，父元素那次 `markTree` 已经走过子元素的整棵子树，子元素自己那次又会再走一遍。

最坏情况是同一帧里一条链 a1 → a2 → … → an 逐个插入到已经在页面上的父节点下：

```
markTree(a1) 走 n 个节点
markTree(a2) 走 n − 1 个节点
...
markTree(an) 走 1 个节点
合计 n(n + 1) / 2 = O(n²)
```

一般情况下，总工作量是 Σ(每个节点上方有几个被新增的祖先)，即 O(n·d)。

**修改前：**

```ts
const markAdded = () => {
  for (const el of added) if (el.isConnected) markTree(el);
  added.clear();
};
```

**修改后：**

```ts
// An element under another added one is covered by that one's walk;
// walking it too would go over its subtree again, once for each added
// element above it.
const markAdded = () => {
  for (const el of added) {
    if (!el.isConnected) continue;
    let p = el.parentElement;
    while (p && !added.has(p)) p = p.parentElement;
    if (!p) markTree(el);
  }
  added.clear();
};
```

思路：对每个元素沿父指针往上找。只要有一个祖先也在 `added` 里，就跳过它，因为祖先那次遍历一定会覆盖它。只有“最上层”的新增元素才调用 `markTree`。

**正确性。**

- `mark` 是幂等的（标记同一个元素两次结果一样），所以跳过重复遍历不会改变结果。
- 如果 `el` 还在文档里，它的祖先也一定在文档里，所以 `isConnected` 的判断对祖先同样成立。
- 小差异：如果祖先是 `SKIP` 里的元素（如 `VIDEO`、`CANVAS`），以前单独插进去的子元素会被标记，现在不会。这反而更符合 `SKIP` 的本意：这些元素内部没有需要保留颜色的文字。

**复杂度。** 向上检查每个元素最多 O(d)，`markTree` 只覆盖不重叠的子树，每个节点最多访问一次。总体从最坏 O(n²) 降到 O(n + k·d)，k 是新增元素数。

**模拟验证。** 用一棵假 DOM 树统计节点访问次数（脚本只做了逻辑模拟，没有在真实浏览器里测）：

| 场景 | n | 修改前 | 修改后 |
|---|---|---|---|
| 一条链逐个插入 | 100 | 5050 | 100 |
| 一条链逐个插入 | 1000 | 500500 | 1000 |
| 先插入 `ul`，再往里插 n 个 `li` | 1000 | 2001 | 1001 |
| n 个互不重叠的兄弟 | 1000 | 1000 | 1000 |

前两行体现了 O(n²) → O(n)；第三行是常见的 2 倍重复；最后一行没有重叠，修改前后一样。

**对应的题。**

- **1233 删除子文件夹**：几乎一模一样。给一组路径，删掉“祖先也在列表里”的路径。LeetCode 上有三种解法：
  1. 哈希集合 + 检查每个前缀：就是这里的做法（`added.has(p)` 沿父指针向上）。
  2. 排序后与上一个保留的路径比较前缀：对应 DOM 里按文档顺序排序（`compareDocumentPosition`）再用 `contains` 比较。
  3. 字典树：对应 DOM 树本身。
- 1376 通知所有员工所需的时间：同样是沿上级关系向上走，用记忆化避免重复。

---

## 7. 按批处理的去重队列

**在做什么。** 读样式会迫使浏览器立即重算样式，所以 Mellow 只在浏览器自己算完样式之后读：`ResizeObserver` 的回调每帧在布局之后、绘制之前触发。`afterLayout(fn)` 把任务排到这个时机执行。

```ts
const queue = new Set<() => void>();

observer ??= new ResizeObserver(() => {
  const fns = [...queue]; // 先拍快照
  queue.clear();          // 再清空
  running = true;
  try {
    for (const f of fns) f();
  } finally {
    running = false;
  }
  if (queue.size > 0) requestAnimationFrame(observe); // 新来的留给下一帧
});
```

**三个知识点。**

1. **用 Set 当队列，天然去重。** 同一个函数在一帧内被请求多次，也只执行一次。
2. **先拍快照再清空。** 执行过程中新加入的任务进入新的 `queue`，不会干扰当前这一批的遍历，也不会无限循环。
3. **分批。** “当前这批”对应这一帧，“新来的”对应下一帧。这和 BFS 层序遍历里“先记下当前层的大小，再处理这么多个节点”是同一个模式。

**对应的题。**

- 102 二叉树的层序遍历。
- 994 腐烂的橘子：按“分钟”分批扩散，和按“帧”分批是一回事。

---

## 8. 两级哈希计数

**在做什么。** popup 要显示页面主要正文的颜色，即在亮度高于阈值的文字颜色中，字数最多的那一种。

```ts
// 第一级：元素 → 字数（同一个父元素下可能有多个文本节点）
const counts = new Map<Element, number>();
for (let n = 0; n < TEXT_NODES && walker.nextNode(); n++) { ... }

// 第二级：颜色 → 字数（getComputedStyle 每个元素只调一次）
const byColor = new Map<string, number>();
for (const [el, len] of counts) { ... }

// 取最大：parseColor 每种颜色只调一次
for (const [color, len] of byColor) { ... }
```

**要点：先分组，再做昂贵的计算。** `getComputedStyle` 按元素去重后调用，`parseColor` 按颜色去重后调用，比对每个文本节点都调一次少得多。

**隐藏的内层循环。** 第二级循环里的 `el.closest('[data-mlw-keep]')` 会沿祖先向上找，是 O(d) 的。整体复杂度是 O(E·d)。可以改成自顶向下：遍历时一旦遇到带 keep 标记的元素，就 `FILTER_REJECT` 剪掉整棵子树，把“祖先里有没有 keep”的信息往下传，而不是每个节点各自往上问。不过这段只在打开 popup 时执行一次，且最多读 3000 个文本节点，没有改。

**对应的题。**

- 347 前 K 个高频元素、451 根据字符出现频率排序：哈希计数。
- 49 字母异位词分组：先分组。
- 1448 统计二叉树中好节点的数目：自顶向下传递祖先信息。

---

## 9. 节流与先到先得

**节流。** 切换主题往往会一次改动很多属性，每次改动都触发 `MutationObserver`。`checkSoon` 保证 80 ms 内最多检查一次：

```ts
let pending = 0;
function checkSoon() {
  if (pending) return;           // 已经安排了，忽略
  pending = window.setTimeout(() => {
    pending = 0;
    look();
  }, 80);
}
```

注意它和**防抖**（debounce）的区别：防抖每次调用都会重置计时器，持续触发就一直不执行；这里第一次调用后 80 ms 一定执行，期间的调用被合并。

**先到先得。** popup 询问页面状态时，有两条路可以回答：下一帧布局完成后（`afterLayout`），或者 300 ms 超时兜底。哪个先到就用哪个，用一个标志保证只回复一次：

```ts
let replied = false;
const answer = () => {
  if (replied) return;
  replied = true;
  // ...
};
afterLayout(answer);
setTimeout(answer, 300);
```

**对应的题。** LeetCode 的 JavaScript 题单里都有：

- 2676 节流。
- 2627 函数防抖。
- 2637 有时间限制的 Promise 对象：超时与正常结果赛跑。
- 2666 只允许一次函数调用：`replied` 标志。

---

## 10. 位运算与矩阵乘法

**位运算拆颜色。** `#rrggbb` 解析成一个整数 n 后，用移位加掩码取出三个分量：

```ts
const n = Number.parseInt(hex.replace('#', ''), 16);
rgbToOklch((n >> 16) & 255, (n >> 8) & 255, n & 255);
```

`>> 16` 把红色移到最低 8 位，`& 255`（即 `& 0xff`）只保留最低 8 位。

**矩阵乘法换颜色空间。** sRGB → OKLab 的核心是两次 3×3 线性变换，中间夹一次立方根：

```
线性 RGB ──M1──> LMS ──∛──> L'M'S' ──M2──> Lab
```

代码里每一行 `0.41·r + 0.53·g + 0.05·b` 就是矩阵的一行与向量的点积。最后 `hypot(A, B)` 和 `atan2(B, A)` 把直角坐标转成极坐标，得到 OKLCH 里的色度 C 和色相 h。

**对应的题。**

- 191 位 1 的个数、190 颠倒二进制位：移位与掩码。
- 48 旋转图像、867 转置矩阵：矩阵操作。

---

## 11. 推公式求反函数

**在做什么。** 亮度曲线是一个有理函数软裁剪：

```
L' = K + d / (1 + B·d),   d = L − K
```

popup 需要它的反函数：要把某种文字亮度 L 压到目标 y，参数 B 应该是多少？`whiteFor` 没有二分，而是直接解方程：

```
y − K = d / (1 + B·d)
⇒  B = (d / (y − K) − 1) / d
```

**与第 3 节对照。** 贝塞尔曲线的逆没有简单的闭式解（通用情况要解三次方程），所以用二分；这条曲线的逆一步就能解出来，所以直接算。**先看能不能推公式，推不出来再搜索。**

**对应的题。**

- 319 灯泡开关、292 Nim 游戏：看似要模拟，推出公式后 O(1)。
- 50 Pow(x, n)：快速幂，也是先推结构再计算。

---

## 嵌套循环 ≠ O(n²)

判断一段嵌套循环快不快，不看有几层，而看**内层总共跑了多少次**。项目里所有的嵌套循环如下：

| 位置 | 形式 | 实际复杂度 | 结论 |
|---|---|---|---|
| `detect.ts` 5×5 网格 | 两层 `for` + 向上找祖先 | O(25·d)，常数规模 | 不用改 |
| `keep.ts` `records × addedNodes` | 两层 `for` | O(新增节点总数)，线性 | 不用改，和 251 展开二维向量一样 |
| `keep.ts` `markAdded` | 循环里套子树遍历 | 最坏 O(n²) | **已改为 O(n + k·d)** |
| `fade.ts` `fadeKeyframes` | 循环 × 二分 × 二分 | 7200 次求值，微秒级 | 可改为一次二分，但没必要 |
| `text.ts` `mainText` | 循环里的 `closest()` | O(E·d)，E ≤ 3000 | 低频，没改 |

**为什么只改了 `markAdded`。** 它跑在 `MutationObserver` 上，执行频率由页面决定，而且是唯一一个规模没有常数上限的嵌套循环。其他几个要么规模固定，要么只在打开 popup、切换开关时跑一次。

**前端和刷题的不同。** 在浏览器里，真正贵的往往不是 JS 循环本身，而是 `getComputedStyle` 引发的样式重算，以及写样式引发的整页重算。所以 Mellow 主要的性能设计不在算法上，而在**时机**上：

- `frame.ts`：只在浏览器已经算好样式之后才读。
- `content.ts` 的 `render`：样式文本没变就不写（`if (text !== style.textContent)`）。
- `fade.ts`：淡入淡出只取 12 个离散值，而不是每帧都变，每次变化都意味着全页重算文字颜色。
