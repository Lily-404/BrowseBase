## BrowseBase 性能分析与优化方向

> 本文档用于记录当前项目的性能现状、已发现的问题点以及优化建议，方便后续按阶段落地。

---

### 1. 技术栈与整体结构概览

- **前端框架**：React 18（`react` / `react-dom`）
- **构建工具**：Vite 6（TypeScript）
- **路由**：`react-router-dom` v7
- **数据访问**：`@supabase/supabase-js` + 自建 `resourceService`
- **状态与数据缓存**：组件内部 `useState` / `useEffect` + 自定义缓存（`Map` / 内存缓存）
- **国际化与埋点**：`react-i18next`、`react-ga4`

整体结构清晰，数据访问也做了分页和缓存，是以「体验优化」和「进一步压缩首屏开销」为主的性能问题，而不是架构性缺陷。

---

### 2. 首屏加载与 Bundle 体积

#### 2.1 现状

- `src/main.tsx` 入口中：
  - 直接导入 `./utils/audioLoader`，触发音频预加载逻辑。
  - 这会将音频加载相关代码打入首屏 bundle，并在应用启动时执行。
- `ResourcePreview` / 首页逻辑中也有：
  - 在组件挂载时通过 `audioLoader.waitForLoad()` 预加载音效。

#### 2.2 问题与影响

- **音频不是首屏必须资源**，却被视为「关键路径」提前加载，导致：
  - 首屏 JS 体积变大。
  - 初始化时多出一次 I/O / 解码开销，拖慢首页可交互时间，尤其在移动端或弱网环境更明显。

#### 2.3 建议优化

- **延迟 / 懒加载音频模块**：
  - 移除 `main.tsx` 中对 `audioLoader` 的直接导入。
  - 改为在「第一次真正需要播放声音」时再去：
    - 异步 `import('./utils/audioLoader')`；
    - 或在 `handleResourceClick` / 盲盒打开时触发 `audioLoader.waitForLoad()`。
- 如此可以：
  - 降低首屏 bundle 体积；
  - 将音频加载挪到「用户交互之后」，对感知性能更友好。

---

### 3. 鉴权与路由性能（ProtectedRoute）

#### 3.1 现状

在 `App.tsx` 中定义了 `ProtectedRoute` 组件，主要逻辑：

- `useEffect` 依赖项为 `[location]`，在每次路由变更时都执行：
  - `checkAuth()`：
    - 调用 `supabase.auth.getSession()`、`supabase.auth.getUser()`；
    - 查询 `profiles` 表获取角色；
  - 注册 `supabase.auth.onAuthStateChange` 订阅；
  - 调用 `trackPageView(location.pathname)` 埋点；
  - 在 effect 清理阶段再 `subscription.unsubscribe()`。

#### 3.2 问题与影响

- 每次路由切换都会：
  - 重新请求 Supabase 一整套认证接口；
  - 重复注册 / 注销 `onAuthStateChange` 订阅。
- 这会带来：
  - **额外的网络往返与 CPU 开销**，在管理后台频繁切页时影响明显；
  - 在弱网场景，经常产生「短暂 loading / 白屏」或明显延迟。

#### 3.3 建议优化

- **拆分副作用，降低调用频率**：
  - 一个 `useEffect`（依赖 `[]`）：
    - 组件挂载时执行一次 `checkAuth()`；
    - 注册 `onAuthStateChange` 监听，在用户登录 / 登出时更新状态；
    - 卸载时取消订阅。
  - 另一个 `useEffect`（依赖 `[location.pathname]`）：
    - 仅负责 `trackPageView(location.pathname)` 埋点。
- **利用本地存储的 `userSession`**：
  - 初始时先从 `localStorage` 读取 `userSession`，预估「是否已登录 & 是否管理员」；
  - 再在后台异步刷新 Supabase 会话结果，从而减少初始加载时的空白等待。

---

### 4. 首页与资源服务层性能

#### 4.1 首页 `Home` 页面

优势：

- 使用了分页 + 缓存 + 预取：
  - `fetchResources` 根据 `currentPage` 与 `activeFilter` 请求数据；
  - 使用 `cachedData`（基于 `page-type-id` 的 key）缓存结果；
  - 命中缓存时直接使用本地数据，并异步 `preloadNextPage` 预拉下一页。

潜在问题：

- **缓存键数量无上限**：
  - 若分类 / 标签很多，且用户长时间操作，`cachedData` 会积累大量 key，占用内存。
- **盲盒逻辑 `fetchAllResources`**：
  - 为盲盒功能一次性拉取所有满足过滤条件的资源，并缓存于 `allResourcesCache`。
  - 当资源数量增大到数百 / 数千时，这会成为明显的慢点。

建议优化：

- 为 `cachedData` 增加一个简单的**容量上限**（如 50 个缓存项），超出后按 FIFO 或 LRU 策略清理旧数据。
- 对盲盒：
  - 增加「最大资源数」限制，例如只拉取最新 N 条（如 200 条）作为盲盒池；
  - 或在后端增加「随机抽样」接口，让数据库层进行随机选取。

#### 4.2 `resourceService` 服务层

现状：

- 使用 `Map` + `timestamp` 做结果缓存，并设置了 5 分钟过期。
- Supabase 查询：
  - 搜索条件时使用 `or(title.ilike..., description.ilike...)`；
  - 普通列表使用 `range` + `order('updated_at', { ascending: false })`，并分页。

评估：

- 整体上实现已经比较合理，**瓶颈更多在「请求频率」与「是否一次拉太多数据」**，不是在接口写法本身。

---

### 5. 组件渲染与交互细节

#### 5.1 `ResourcePreview` 列表组件

现状：

- 使用 `memo(ResourcePreview)`；
- 通过 `useMemo` / `useCallback` 构造：
  - `renderResources`（包含 hover / 3D 动画、动态 box-shadow、`transformOrigin` 计算等）；
  - `renderSkeleton` 骨架屏；
- 做了移动端分支：
  - 移动端不启用 hover/3D/放大效果，仅展示简化卡片。

潜在问题：

- 鼠标移动时，会频繁更新 `tilt` 状态，导致 `renderResources` 的 `useMemo` 重新计算整组 JSX。
- 当前一页卡片约 12 个，这种开销是可以接受的；若未来卡片数明显增多，则可能成为渲染瓶颈。

建议：

- 如需进一步优化（主要在大列表场景）：
  - 将单个卡片拆分为独立组件 `ResourceCard`；
  - 通过 `memo(ResourceCard)` + 合理 props，确保 hover 只造成单卡片重渲染，而非整列表。

#### 5.2 Loading 动画与全屏遮罩

现状：

- 首页与 Admin 均使用了带渐变、blur、阴影与旋转动画的全屏 Loading 遮罩。

影响：

- 此类复杂 CSS 动画在低端设备上会增加 GPU 压力；
- 若加载时间与动画时长叠加不当，可能出现「数据已就绪但用户仍在等待动画结束」的情况。

建议：

- 若出现明显卡顿：
  - 减少阴影层数、blur 强度和动画复杂度；
  - 缩短初始动画持续时间，让内容更快露出。

---

### 6. 管理后台（Admin）性能

优势：

- 数据列表采用服务端分页，每页渲染数量有限；
- 搜索使用 `lodash.debounce` 做防抖，避免每次输入即发请求；
- `fetchResources` 包装在 `useCallback` 中，并通过单一 `useEffect` 触发，逻辑简单。

潜在优化点：

- 搜索建议 `getSearchSuggestions`：
  - 若用户高频输入且资源量巨大，可以增加简单的本地缓存或限制调用频率；
  - 目前实现对中小规模数据是足够的，属于「可选优化」。
- 主题切换 `isRetroTheme`：
  - 切换时会导致较大范围 DOM 的 className 变化，引发整块重渲染；
  - 但这是低频交互，对整体性能影响可接受。

---

### 7. 推荐的优化落地优先级

1. **首屏关键路径精简**
   - 懒加载 / 延后加载 `audioLoader` 和所有非必要首屏模块。
2. **鉴权与路由副作用优化**
   - 重构 `ProtectedRoute`：
     - 首次挂载时鉴权 + 注册 Supabase 事件；
     - 路由变化仅触发埋点，而不是重新鉴权。
3. **缓存与大查询策略**
   - 为首页 `cachedData` 与盲盒 `fetchAllResources` 增加容量 / 结果上限与清理策略。
4. **渲染与动画细节**
   - 若实际体验中有卡顿，再精简 3D 效果、拆分卡片组件、简化 Loading 动画。

---

### 8. 后续工作建议

- 将本分析与 `doc/TODO.md` 中的任务关联起来：
  - 对应每个建议，在 TODO 中创建具体可执行条目（含状态与优先级）。
- 每完成一项优化：
  - 在此文档中补充「前后性能对比」（如首屏时间、接口耗时、Lighthouse 得分等），便于长期迭代与回溯。

