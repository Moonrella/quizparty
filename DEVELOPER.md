# QuizParty 开发者指南

> 本文档面向初学者，帮助你理解和修改 QuizParty 的代码。
> 即使你没有编程经验，也可以跟着步骤一步步来。

---

## 目录

1. [环境准备](#1-环境准备)
2. [项目结构一览](#2-项目结构一览)
3. [如何启动和运行](#3-如何启动和运行)
4. [核心概念：文件各管什么](#4-核心概念文件各管什么)
5. [修改 UI 和外观](#5-修改-ui-和外观)
6. [修改游戏逻辑](#6-修改游戏逻辑)
7. [添加新题目](#7-添加新题目)
8. [添加新主题](#8-添加新主题)
9. [修改棋盘和格子](#9-修改棋盘和格子)
10. [常见问题排查](#10-常见问题排查)
11. [部署到网上](#11-部署到网上)

---

## 1. 环境准备

### 你需要安装什么

| 工具 | 用途 | 下载地址 |
|------|------|----------|
| **Node.js** | 运行项目的基础环境 | https://nodejs.org （选 LTS 版本） |
| **VS Code** | 代码编辑器（推荐） | https://code.visualstudio.com |
| **Git**（可选） | 版本管理 | https://git-scm.com |

### 安装后验证

打开终端（Windows 搜索 "cmd" 或 "PowerShell"），输入：

```bash
node --version    # 应显示 v18 或更高
npm --version     # 应显示 9 或更高
```

### 用 VS Code 打开项目

1. 打开 VS Code
2. 点 `文件` → `打开文件夹`
3. 选择 `C:\Users\Human\quizparty`

---

## 2. 项目结构一览

```
quizparty/
├── index.html              ← 网页入口，浏览器加载这个文件
├── package.json            ← 项目配置：依赖列表、启动命令
├── tsconfig.json           ← TypeScript 配置（不用管）
├── vite.config.ts          ← 构建工具配置（不用管）
│
├── public/                 ← 静态资源（图标、图片等）
│   └── vite.svg
│
├── src/                    ← ★ 所有源代码都在这里
│   ├── main.tsx            ← 程序启动入口
│   ├── App.tsx             ← 路由：哪个网址显示哪个页面
│   ├── index.css           ← ★ 全局样式（改颜色改这里）
│   ├── types.ts            ← 数据类型定义（改功能时参考）
│   │
│   ├── pages/              ← 三个页面
│   │   ├── Lobby.tsx       ← ★ 大厅页（设置玩家、选棋盘）
│   │   ├── Game.tsx        ← ★ 游戏主页面（最重要的文件）
│   │   └── QuestionBank.tsx ← 题库管理页
│   │
│   ├── components/         ← 可复用的组件
│   │   ├── Board.tsx       ← 棋盘渲染
│   │   ├── Quiz.tsx        ← 答题弹窗（选题 + 答题）
│   │   ├── Wheel.tsx       ← 转盘
│   │   ├── FortuneMode.tsx ← 特殊模式（抢答面板）
│   │   └── HostPanel.tsx   ← 主持人控制台
│   │
│   ├── stores/             ← 数据管理（存取数据）
│   │   ├── gameStore.ts    ← 游戏状态（玩家、金币、位置）
│   │   └── questionStore.ts ← 题库管理
│   │
│   └── data/               ← 静态数据
│       ├── defaultQuestions.ts ← 默认题库（162道题）
│       ├── boardPresets.ts     ← 4种棋盘布局
│       ├── themes.ts           ← 9大主题定义 + 难度奖励表
│       └── emojiLibrary.ts     ← 可选的 emoji 列表
│
└── dist/                   ← 构建产物（npm run build 生成）
    └── index.html          ← 离线可用的完整网页
```

### 最重要的几个文件

| 你想改什么 | 去哪个文件 |
|-----------|-----------|
| 颜色、字体、整体风格 | `src/index.css` |
| 游戏流程、回合逻辑 | `src/pages/Game.tsx` |
| 大厅页面的布局 | `src/pages/Lobby.tsx` |
| 默认题目内容 | `src/data/defaultQuestions.ts` |
| 棋盘格子的排列 | `src/data/boardPresets.ts` |
| 答题的显示效果 | `src/components/Quiz.tsx` |

---

## 3. 如何启动和运行

在 VS Code 中打开终端（快捷键 `Ctrl + `` `），输入：

```bash
# 安装依赖（只需执行一次）
npm install

# 启动开发服务器（每次改代码时用）
npm run dev
```

然后浏览器打开 http://localhost:5173

> **提示**：改代码后保存文件，浏览器会自动刷新，不用手动刷新。

### 构建离线版本

```bash
npm run build
```

会在 `dist/` 文件夹生成离线版本，可以拷贝到 U 盘。

---

## 4. 核心概念：文件各管什么

### 页面 vs 组件

- **页面**（`pages/`）：每个页面是一个完整的屏幕，通过路由切换
  - `/` → Lobby.tsx（大厅）
  - `/game` → Game.tsx（游戏）
  - `/questions` → QuestionBank.tsx（题库管理）

- **组件**（`components/`）：可复用的 UI 零件，被页面调用
  - Board 棋盘、Quiz 答题框、Wheel 转盘等

### 数据流

```
玩家操作 → 调用 stores/ 中的函数 → 更新 state → React 自动刷新界面
```

- `gameStore.ts`：管理游戏状态（谁在哪个格子、多少金币、轮到谁）
- `questionStore.ts`：管理题库（增删改查题目）
- 数据保存在浏览器的 `localStorage`，所以关闭网页再打开进度还在

### TypeScript 是什么？

文件后缀是 `.tsx`（不是 `.js`），说明用了 TypeScript。
简单说就是在 JavaScript 基础上加了类型检查，帮你发现错误。
你写代码时照葫芦画瓢就行，类型不对时会有红色波浪线提示。

---

## 5. 修改 UI 和外观

### 改全局颜色

打开 `src/index.css`，找到 `:root` 部分：

```css
:root {
  --bg: #1a1a2e;          /* 背景色 → 改成你想要的颜色 */
  --surface: #252547;     /* 卡片背景色 */
  --surface2: #2d2d55;    /* 输入框/次级背景色 */
  --text: #eee;           /* 文字颜色 */
  --text-dim: #aaa;       /* 次要文字颜色（灰色说明文字） */
  --accent: #6c5ce7;      /* 强调色（按钮、链接） → 改成你喜欢的颜色 */
  --accent-light: #a29bfe;/* 浅强调色 */
  --success: #00b894;     /* 成功/正确 → 绿色 */
  --danger: #e17055;      /* 错误/危险 → 红色 */
  --warning: #fdcb6e;     /* 警告/金币 → 黄色 */
}
```

**颜色格式**：`#` + 6位十六进制数。可以用在线取色器 https://htmlcolorcodes.com 选颜色。

### 添加新主题

在 `src/index.css` 末尾添加新的主题样式，例如：

```css
[data-theme="sakura"] {
  --bg: #2b1a2e;
  --surface: #3d2547;
  --surface2: #4d3555;
  --text: #f5e0f0;
  --text-dim: #c4a0b8;
  --accent: #e84393;
  --accent-light: #fd79a8;
}
```

然后在 `src/pages/Lobby.tsx` 中，找到 `THEMES` 数组，加一项：

```typescript
const THEMES = [
  { id: 'dark', label: '🌙 深色' },
  { id: 'light', label: '☀️ 浅色' },
  { id: 'warm', label: '🔥 暖色' },
  { id: 'ocean', label: '🌊 海洋' },
  { id: 'sakura', label: '🌸 樱花' },  // ← 新增
]
```

### 改按钮大小/圆角

在 `src/index.css` 中找到 `.btn`：

```css
.btn {
  padding: 12px 24px;        /* 上下12 左右24 → 改大改小 */
  border-radius: 8px;        /* 圆角 → 改成 0 就是直角，改成 20px 更圆 */
  font-size: 1rem;           /* 字体大小 → 改成 1.2rem 更大 */
}
```

### 改卡片样式

找到 `.card`：

```css
.card {
  background: var(--surface);  /* 背景色 */
  border-radius: 12px;         /* 圆角 */
  padding: 24px;               /* 内边距 */
  /* 你可以加： */
  /* border: 1px solid var(--accent); */  /* 加边框 */
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.3); */  /* 加阴影 */
}
```

---

## 6. 修改游戏逻辑

### 游戏流程（Game.tsx 核心逻辑）

```
掷骰子 → 选主题 → 答题 → 答对前进+金币
                          → 落地格触发事件：
                              转盘格 → 转盘抽题 → 答题
                              命运格 → 特殊模式抢答
                              地产格 → 购买/交过路费
                              宝箱格 → 随机金币
                              安全格 → 无事发生
                          → 下一位玩家
```

### 关键函数说明

在 `src/pages/Game.tsx` 中：

| 函数名 | 作用 | 你可能想改什么 |
|--------|------|---------------|
| `handleRoll` | 掷骰子动画和逻辑 | 改骰子动画速度 |
| `handleThemeSelect` | 玩家选了主题后抽题 | 改抽题规则 |
| `handleQuizAnswer` | 答对/答错后处理 | 改答对奖励/答错惩罚 |
| `handleEventContinue` | 点击"继续"后处理格子事件 | 改格子事件逻辑 |
| `handleBuyProperty` | 购买地产 | 改购买逻辑 |
| `handleSkipBuy` | 跳过购买 | - |

### 改答对的金币奖励

打开 `src/data/themes.ts`，找到 `COIN_REWARDS`：

```typescript
export const COIN_REWARDS: Record<number, number> = {
  1: 10,   // 难度1答对得10金币
  2: 20,   // 难度2答对得20金币
  3: 35,
  4: 50,
  5: 70,
  6: 100,  // 难度6答对得100金币 → 随便改数字
};
```

### 改初始金币

打开 `src/stores/gameStore.ts`，找到 `createGameState` 函数：

```typescript
const players: Player[] = playerConfigs.map(p => ({
  ...
  coins: 50,    // ← 改这个数字，比如改成 100
  ...
}));
```

---

## 7. 添加新题目

### 方式一：在游戏内添加（最简单）

在大厅点「📝 管理题库」→ 在顶部表单填写 → 点「✅ 添加」

### 方式二：直接改代码

打开 `src/data/defaultQuestions.ts`，照着格式添加：

```typescript
{
  id: 'my-new-q1',           // 唯一ID，不能重复
  theme: 'tech',             // 主题ID（见下方主题列表）
  difficulty: 3,             // 难度1-6
  question: '你的题目？',     // 题目文字
  options: ['选项A', '选项B', '选项C', '选项D'],  // 4个选项
  correctIndex: 2,           // 正确答案是第几个（从0开始数！0=A, 1=B, 2=C, 3=D）
},
```

**主题ID对照表**：

| 主题 | ID |
|------|-----|
| 科技 | `tech` |
| 文学 | `literature` |
| 艺术 | `art` |
| 娱乐 | `entertainment` |
| 美食 | `food` |
| 体育 | `sports` |
| 地理 | `geography` |
| 自然 | `nature` |
| 历史 | `history` |

### 方式三：JSON 导入

准备 JSON 文件，格式如下：

```json
[
  {
    "theme": "tech",
    "difficulty": 1,
    "question": "题目？",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0
  }
]
```

在题库管理页点「📥 从文件导入」。

---

## 8. 添加新主题

### 步骤

**第1步**：打开 `src/data/themes.ts`，在 `THEMES` 数组加一项：

```typescript
export const THEMES: ThemeInfo[] = [
  // ... 已有的
  { id: 'music', name: '音乐', emoji: '🎵' },  // ← 新增
];
```

**第2步**：打开 `src/data/defaultQuestions.ts`，添加该主题的题目：

```typescript
// ===== 音乐 (music) =====
{ id: 'm1-1', theme: 'music', difficulty: 1, question: '...', options: [...], correctIndex: 0 },
// 每个难度至少放2-3题
```

**第3步**：保存，刷新浏览器，新主题就会出现在选择界面中。

---

## 9. 修改棋盘和格子

### 棋盘布局在哪

打开 `src/data/boardPresets.ts`。

每个棋盘由一组坐标定义，例如蛇形棋盘：

```typescript
const snakeLayout: number[][] = [
  [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],  // 第0行，从左到右
  [1,5],[1,4],[1,3],[1,2],[1,1],[1,0],  // 第1行，从右到左
  // ... 以此类推
];
```

- 每个 `[行, 列]` 代表棋盘上一个格子的位置
- 数组的顺序就是格子编号（0号、1号、2号...）

### 格子类型

```typescript
const snakeTypes: TileType[] = [
  'safe',     // ☕ 安全格
  'property', // 🏠 地产格
  'treasure', // 💰 宝箱格
  'wheel',    // 🎡 转盘格
  'fortune',  // 🔮 命运格
];
```

- 数组长度和 layout 一致
- 循环使用（如果 types 比 layout 短，会从头循环）

### 自己画一个新棋盘

1. 在 `boardPresets.ts` 里新增 `const myLayout = [...]` 和 `const myTypes = [...]`
2. 在 `BOARD_PRESETS` 数组里添加一项：

```typescript
{
  id: 'my-board',
  name: '我的棋盘',
  emoji: '⭐',
  description: '我自己设计的棋盘',
  rows: 6,        // 行数
  cols: 8,        // 列数
  tiles: makeTiles(myLayout, myTypes),
  size: myLayout.length,
},
```

3. 保存刷新，大厅里就能看到新棋盘了。

---

## 10. 常见问题排查

### 改了代码但没效果？

1. 确认保存了文件（Ctrl+S）
2. 确认 `npm run dev` 还在运行
3. 浏览器按 F5 强制刷新

### 页面报红/编译失败？

1. 看终端里的错误信息，通常会告诉你是哪个文件哪一行
2. 最常见的原因：少了逗号、括号没配对、引号没闭合
3. 改回来保存即可

### 怎么恢复到之前的状态？

如果有 Git：`git checkout -- 文件路径`
没有 Git：只能手动改回去（建议学一下 Git 基础）

### 数据存在哪？

- 游戏进度：浏览器 localStorage（键名 `quizparty_game_v2`）
- 题库数据：浏览器 localStorage（键名 `quizparty_questions_v2`）
- 清除浏览器数据会丢失自定义题库

---

## 11. 部署到网上

### GitHub Pages（推荐）

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "初始版本"

# 2. 在 GitHub 创建一个仓库（比如叫 quizparty）

# 3. 关联并推送
git remote add origin https://github.com/你的用户名/quizparty.git
git push -u origin main

# 4. 安装 gh-pages 部署工具
npm install -D gh-pages

# 5. 在 package.json 中加：
# "homepage": "https://你的用户名.github.io/quizparty"
# scripts 中加："deploy": "npm run build && gh-pages -d dist"

# 6. 部署
npm run deploy
```

部署后访问 `https://你的用户名.github.io/quizparty` 就能玩了。

### 局域网分享（同一WiFi下）

```bash
npx vite --host
```

终端会显示一个 `http://192.168.x.x:5173` 地址，其他设备打开这个地址即可。

---

## 附录：快速修改速查表

| 我想改... | 文件 | 找什么 |
|-----------|------|--------|
| 背景颜色 | `src/index.css` | `:root { --bg: ... }` |
| 按钮颜色 | `src/index.css` | `:root { --accent: ... }` |
| 正确/错误颜色 | `src/index.css` | `--success` / `--danger` |
| 初始金币 | `src/stores/gameStore.ts` | `coins: 50` |
| 答对奖励 | `src/data/themes.ts` | `COIN_REWARDS` |
| 默认题目 | `src/data/defaultQuestions.ts` | 直接编辑 |
| 棋盘布局 | `src/data/boardPresets.ts` | `xxxLayout` 数组 |
| emoji 列表 | `src/data/emojiLibrary.ts` | `EMOJI_LIBRARY` 数组 |
| 骰子动画速度 | `src/pages/Game.tsx` | `handleRoll` 中的 `80` 和 `> 8` |
| 转盘动画时间 | `src/components/Wheel.tsx` | `3000`（毫秒） |
| 地产价格 | `src/data/boardPresets.ts` | `propertyPrice` / `toll` |

---

> 💡 **建议**：修改前先复制一份文件做备份。改坏了可以复制回来。
> 
> 有任何问题，可以随时在对话中问我！
