# Novel Reader Extension - 项目索引地图

> Chrome 扩展 (Manifest V3) 小说阅读器，基于 WXT + React 18 + TypeScript + Tailwind CSS，支持独立单文件 HTML 构建。

---

## 目录结构

```
novel-reader-extension/
├── entrypoints/                    # WXT 入口点
│   ├── background.ts               # Service Worker：初始化存储、侧边栏行为、消息监听
│   ├── popup/                      # 弹出面板（迷你状态）
│   │   ├── App.tsx                 #   书名 + 进度条 + 打开侧边栏按钮
│   │   ├── index.html
│   │   └── main.tsx
│   └── sidepanel/                  # 侧边面板（完整阅读器）
│       ├── App.tsx                 #   ReaderProvider + ReaderShell
│       ├── index.html
│       └── main.tsx
├── src/                            # 共享源码
│   ├── components/                 # UI 组件
│   │   ├── bookshelf/BookshelfPanel.tsx   # 书架列表
│   │   ├── layout/ReaderShell.tsx         # 主布局壳（桌面/紧凑模式）
│   │   ├── reader/ChapterOutline.tsx      # 章节侧边栏
│   │   ├── reader/ReaderPane.tsx          # 正文阅读 + 翻页导航
│   │   ├── search/SearchBox.tsx           # 搜索输入 + 结果导航
│   │   └── settings/SettingsPanel.tsx     # 设置面板
│   ├── constants/                  # 常量定义
│   │   ├── chapterPatterns.ts      #   13 个章节正则（第X章/卷/序章/番外/Chapter 等）
│   │   ├── defaults.ts            #   默认配置 & 初始状态
│   │   └── themes.ts              #   8 套主题 × 30 CSS 变量
│   ├── hooks/
│   │   └── useThemeVariables.ts    # 将主题 CSS 变量注入 :root
│   ├── lib/                        # 核心业务逻辑
│   │   ├── book/
│   │   │   ├── fileReader.ts       #   TXT 文件读取 + 编码检测（UTF-8→GBK→容错UTF-8）
│   │   │   ├── hash.ts             #   SHA-256 内容哈希（Web Crypto API）
│   │   │   ├── pagination.ts       #   按字符数分页
│   │   │   ├── parser.ts           #   章节检测与解析
│   │   │   └── search.ts           #   全文关键词搜索（带上下文）
│   │   └── storage/
│   │       ├── chromeStorage.ts    #   双模式存储（Chrome/localStorage + IndexedDB）
│   │       └── migrations.ts       #   状态迁移（补全缺失字段）
│   ├── state/                      # 状态管理
│   │   ├── ReaderContext.tsx        #   Context Provider + 10 个 action 方法
│   │   ├── readerReducer.ts        #   Reducer（11 种 action type）
│   │   ├── readerTypes.ts          #   全部 TypeScript 类型定义
│   │   └── selectors.ts            #   选择器 & 持久化映射
│   └── styles/
│       └── globals.css             # Tailwind + CSS 变量默认值
├── standalone/                     # 独立构建入口
│   ├── index.html                  #   单文件 HTML 模板
│   └── main.tsx                    #   独立 React 入口
├── scripts/
│   └── build-standalone.js         # 独立构建脚本（内联所有资源到单个 HTML）
├── .output/                        # 构建产物
│   ├── chrome-mv3/                 #   Chrome 扩展
│   └── standalone/                 #   独立 HTML
├── package.json
├── wxt.config.ts                   # WXT 配置
├── vite.config.standalone.ts       # 独立构建 Vite 配置
├── vitest.config.ts
├── tsconfig.json
├── postcss.config.cjs
└── tailwind.config.ts
```

---

## 架构概览

```
┌──────────────────────────────────────────────────────────┐
│                   Chrome Extension                        │
│                                                           │
│  ┌─────────┐    message     ┌──────────────┐             │
│  │  Popup   │ ─────────────→ │  Background   │             │
│  │ (状态预览) │  openSidePanel│  (Service     │             │
│  └─────────┘               │   Worker)     │             │
│                             └──────┬───────┘             │
│                                    │ setPanelBehavior     │
│                                    ▼                      │
│                             ┌──────────────┐             │
│                             │  Side Panel   │             │
│                             │  (完整阅读器)  │             │
│                             └──────┬───────┘             │
└────────────────────────────────────┼─────────────────────┘
                                     │
         ┌───────────────────────────┼──────────────────────┐
         │                    React App                      │
         │                           │                       │
         │  ┌────────────────────────▼────────────────────┐ │
         │  │            ReaderContext                     │ │
         │  │  ┌─────────────────────────────────────┐    │ │
         │  │  │         readerReducer               │    │ │
         │  │  │  11 Action Types → State Updates    │    │ │
         │  │  └─────────────────────────────────────┘    │ │
         │  │                                             │ │
         │  │  Actions: hydrate, importFiles, openBook,   │ │
         │  │  removeBook, renameBook, setPage,           │ │
         │  │  updateConfig, search, goToSearchResult,    │ │
         │  │  clearSearch                                │ │
         │  └────────────┬───────────────────────────────┘ │
         │               │                                   │
         │  ┌────────────┼─────────────────────────────┐   │
         │  │            ▼                              │   │
         │  │       ReaderShell                        │   │
         │  │  ┌──────────┐ ┌──────────────────────┐  │   │
         │  │  │ Sidebar  │ │     Main Area         │  │   │
         │  │  │ Bookshelf│ │  Titlebar + Settings  │  │   │
         │  │  │ Search   │ │  ReaderPane (阅读区)   │  │   │
         │  │  │ Chapters │ │  Statusbar            │  │   │
         │  │  └──────────┘ └──────────────────────┘  │   │
         │  └─────────────────────────────────────────┘   │
         │                                                  │
         │  ┌─────────────────────────────────────────┐   │
         │  │           Storage Layer                  │   │
         │  │  chrome.storage.local / localStorage     │   │
         │  │  + IndexedDB (bookContents)              │   │
         │  └─────────────────────────────────────────┘   │
         └──────────────────────────────────────────────┘
```

---

## 类型系统一览

### 核心类型 (`src/state/readerTypes.ts`)

| 类型 | 说明 | 关键字段 |
|------|------|----------|
| `ThemeName` | 8 种主题名 | `'Dark+ (default dark)'`, `'Light+ (default light)'`, `'Monokai'`, `'Solarized Dark'`, `'One Dark Pro'`, `'护眼·米黄'`, `'护眼·淡绿'`, `'护眼·浅棕'` |
| `ReaderConfig` | 用户配置 | `theme`, `wordsPerPage`(800), `fontFamily`, `fontSize`, `sidebarVisible`, `lastOpenedBookId` |
| `BookMeta` | 书籍元数据 | `id`, `name`, `originalFileName`, `size`, `lastModified`, `contentHash`, `importedAt`, `updatedAt` |
| `ReadingProgress` | 阅读进度 | `bookId`, `page`, `lastOpened`(时间戳) |
| `Chapter` | 解析章节 | `title`, `charPos`(字符偏移), `page`(页码) |
| `SearchResult` | 搜索结果 | `position`, `page`, `keyword`, `context`(上下文) |
| `BookDerivedData` | 派生缓存数据 | `bookId`, `chapters[]`, `totalPages`, `contentLength`, `wordsPerPage`, `updatedAt` |
| `PersistedState` | 持久化状态 | `version`, `config`, `books[]`, `progressByBookId`, `derivedByBookId` |
| `ReaderRuntimeState` | 运行时完整状态 | `PersistedState` + `hydrated`, `currentBookId`, `currentContent`, `pages[]`, `chapters[]`, `currentPage`, `searchKeyword`, `searchResults[]`, `currentSearchIndex`, `loading`, `error` |

---

## Reducer Actions (`src/state/readerReducer.ts`)

| Action Type | Payload | 效果 |
|-------------|---------|------|
| `HYDRATE_SUCCESS` | `PersistedState` | 加载持久化状态，标记 `hydrated: true` |
| `SET_LOADING` | `boolean` | 切换加载状态 |
| `SET_ERROR` | `string \| null` | 设置/清除错误信息 |
| `IMPORT_BOOK_SUCCESS` | `book, derived` | 添加书籍到列表和派生数据 |
| `OPEN_BOOK_SUCCESS` | `bookId, content, pages, chapters, page` | 设置当前书籍，重置搜索 |
| `REMOVE_BOOK` | `bookId` | 移除书籍及关联数据 |
| `RENAME_BOOK` | `bookId, name` | 重命名书籍 |
| `SET_PAGE` | `page` | 更新当前页码和阅读进度 |
| `UPDATE_CONFIG` | `Partial<ReaderConfig>` + 可选分页数据 | 合并配置，可选重算分页 |
| `SET_SEARCH` | `keyword, results, currentIndex` | 设置搜索结果 |
| `GO_TO_SEARCH_RESULT` | `index` | 跳转到搜索结果页（内部 dispatch SET_PAGE） |
| `CLEAR_SEARCH` | — | 重置搜索状态 |

---

## Context Actions (`src/state/ReaderContext.tsx`)

| 方法 | 签名 | 行为 |
|------|------|------|
| `hydrate` | `() => Promise<void>` | 初始化加载持久化状态 |
| `importFiles` | `(files: File[]) => Promise<void>` | 校验 TXT → 读取内容 → SHA-256 哈希 → 存 IndexedDB |
| `openBook` | `(bookId: string) => Promise<void>` | 从 IndexedDB 加载内容 → 分页 → 解析章节 |
| `removeBook` | `(bookId: string) => Promise<void>` | 删除 IndexedDB 内容 → 移除状态 |
| `renameBook` | `(bookId: string, name: string) => Promise<void>` | 修剪名称 → 更新状态 |
| `setPage` | `(page: number) => Promise<void>` | 限制页码范围 → dispatch SET_PAGE |
| `updateConfig` | `(config: Partial<ReaderConfig>) => Promise<void>` | 若 `wordsPerPage` 变化则重算分页 |
| `search` | `(keyword: string) => void` | 调用 `searchBook()` → dispatch SET_SEARCH |
| `goToSearchResult` | `(index: number) => Promise<void>` | dispatch GO_TO_SEARCH_RESULT |
| `clearSearch` | `() => void` | dispatch CLEAR_SEARCH |

---

## 存储架构 (`src/lib/storage/chromeStorage.ts`)

### 双模式运行

| | Chrome 扩展模式 | 独立模式 |
|---|---|---|
| **应用状态** | `chrome.storage.local` key `'novelReader.state'` | `localStorage` key `'novelReader.state'` |
| **书籍内容** | IndexedDB: `'novel-reader'` / `'bookContents'` | 同左 |
| **自动迁移** | 旧格式 `chrome.storage.local` 中的内容自动迁至 IndexedDB | 不适用 |

### 持久化字段

- `version` — 版本号（迁移用）
- `config` — ReaderConfig
- `books` — BookMeta[]
- `progressByBookId` — Record<string, ReadingProgress>
- `derivedByBookId` — Record<string, BookDerivedData>

---

## 核心库函数

### 文件读取 (`src/lib/book/fileReader.ts`)
- `isTextFile(file)` — 检查 `.txt` 扩展名或 `text/plain` MIME
- `readTextFile(file)` — ArrayBuffer → UTF-8(strict) → GBK → UTF-8(lenient) 编码检测链

### 内容哈希 (`src/lib/book/hash.ts`)
- `sha256Hex(input)` — Web Crypto API SHA-256 → hex 字符串

### 分页 (`src/lib/book/pagination.ts`)
- `paginate(content, charsPerPage)` — 按字符数等长切分

### 章节解析 (`src/lib/book/parser.ts`)
- `parseChapters(content, wordsPerPage)` — 13 种正则匹配中文章节标题 → 去重排序 → Chapter[]

### 搜索 (`src/lib/book/search.ts`)
- `searchBook(content, keyword, wordsPerPage, contextRadius=15)` — 顺序 indexOf 扫描 → SearchResult[]

---

## Chrome 扩展消息协议

| 方向 | 消息 | 处理 |
|------|------|------|
| Popup → Background | `{ action: 'openSidePanel' }` | 打开发送者 tab 的侧边面板 |
| Background (install) | — | 初始化默认状态 + 设置 sidePanel 行为 |

权限：`storage`, `sidePanel`

---

## 主题系统 (`src/constants/themes.ts`)

- 8 套主题，每套 30 个 CSS 自定义属性
- 命名空间：`--nr-*` CSS 变量 ↔ `nr.*` Tailwind 别名
- Hook：`useThemeVariables(themeName)` 注入到 `document.documentElement`
- 默认主题：`Dark+ (default dark)`

---

## UI 布局 (`src/components/layout/ReaderShell.tsx`)

| 模式 | 宽度阈值 | 侧边栏 | 切换方式 |
|------|----------|--------|----------|
| 桌面 | > 600px | 固定显示（w-56 / w-72） | 配置项 `sidebarVisible` |
| 紧凑 | ≤ 600px | 抽屉式滑入（absolute） | 汉堡菜单按钮 |

### ReaderPane 交互
- 左键 / → / ↓ = 下一页
- 右键 / ← / ↑ = 上一页
- 滑块 = 页码快速跳转
- 搜索高亮 = `<mark>` 元素

---

## 独立构建 (`scripts/build-standalone.js` + `vite.config.standalone.ts`)

- 使用 `@vitejs/plugin-react`
- `inlineAssets()` 插件：CSS → `<style>` 内联，JS → blob URL 嵌入
- 产物：单个 `index.html`，支持 `file://` 协议直接打开
- blob URL 技术绕过 `file://` 的 ES module CORS 限制

---

## 数据流

```
用户导入 TXT 文件
    │
    ▼
fileReader.readTextFile() ──→ 文本内容（编码自动检测）
    │
    ├──→ hash.sha256Hex() ──→ contentHash（去重标识）
    │
    ├──→ pagination.paginate() ──→ pages[]
    │
    ├──→ parser.parseChapters() ──→ chapters[]
    │
    ▼
chromeStorage.savePersistedState() ──→ chrome.storage.local / localStorage
chromeStorage.saveBookContent()     ──→ IndexedDB
    │
    ▼
ReaderContext dispatch IMPORT_BOOK_SUCCESS
```

---

## 快速定位索引

| 需求 | 文件路径 |
|------|----------|
| 添加新主题 | `src/constants/themes.ts` |
| 修改章节识别规则 | `src/constants/chapterPatterns.ts` |
| 调整默认配置 | `src/constants/defaults.ts` |
| 新增 Reducer Action | `src/state/readerReducer.ts` + `readerTypes.ts` + `ReaderContext.tsx` |
| 修改存储逻辑 | `src/lib/storage/chromeStorage.ts` |
| 修改编码检测 | `src/lib/book/fileReader.ts` |
| 修改分页算法 | `src/lib/book/pagination.ts` |
| 修改搜索逻辑 | `src/lib/book/search.ts` |
| 修改布局/响应式 | `src/components/layout/ReaderShell.tsx` |
| 修改阅读区交互 | `src/components/reader/ReaderPane.tsx` |
| 修改 Chrome 扩展行为 | `entrypoints/background.ts` |
| 修改弹出面板 | `entrypoints/popup/App.tsx` |
| 修改 CSS 变量/样式 | `src/styles/globals.css` + `tailwind.config.ts` |
| 修改独立构建 | `vite.config.standalone.ts` + `scripts/build-standalone.js` |
