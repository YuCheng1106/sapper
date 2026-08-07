# Sapper Web

`sapper_web` 是 Sapper 的前端 Web 应用，提供 Agent 工作台、知识库管理、插件管理、Agent 市场、发布管理、用户中心、登录注册和 OAuth 回调等页面。

项目基于 React、TypeScript、Vite、Ant Design、Redux Toolkit 和 Tailwind CSS 构建。前端主要调用 `sapper_backend` 的 `/api/v1` 接口，部分 Markdown 转换能力会调用 `sapper_server` 的 `/server/api/v1/custom-plugin` 接口。

## 技术栈

- React 18
- TypeScript
- Vite 6
- Ant Design 5 / Ant Design Pro Components
- Redux Toolkit / React Redux
- React Router
- Tailwind CSS
- Axios
- Slate / React Markdown / KaTeX
- COS JS SDK

## 目录结构

```text
sapper_web/
├── public/              # 静态资源
├── src/
│   ├── api/             # HTTP API 封装
│   ├── assets/          # 图片、样式、脚本资源
│   ├── components/      # 页面组件和业务组件
│   ├── constants/       # 常量
│   ├── hooks/           # 业务 hooks
│   ├── modals/          # 弹窗组件
│   ├── pages/           # 页面入口
│   ├── router/          # React Router 路由
│   ├── service/         # 业务 service 层
│   ├── stores/          # Redux store 和 slice
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数
├── nginx.conf           # 生产 Nginx 配置
├── vite.config.ts       # Vite 配置
├── package.json         # npm/pnpm 脚本和依赖
└── tsconfig*.json       # TypeScript 配置
```

## 前置依赖

- Node.js 20 或更高版本
- pnpm
- 正在运行的 `sapper_backend`
- 可选：正在运行的 `sapper_server`，用于 Markdown 转 PDF/图片/DOCX 等能力

## 环境变量

复制仓库提供的环境变量模板：

```bash
cd sapper_web
cp .env.example .env.development
```

生产构建可创建 `.env.production`：

```env
VITE_API_BASE_URL=https://your-api-domain/
VITE_RUNTIME_API_BASE_URL=https://your-runtime-domain/server/
VITE_AGENT_API_BASE_URL=https://your-api-domain/api/v1/sapper/sapperchain/api/
```

说明：

- `VITE_API_BASE_URL` 会在 `src/api/interceptor.ts` 中作为 axios `baseURL`。
- 项目里的 API 路径大多以 `/api/v1/...` 开头，所以 `VITE_API_BASE_URL` 建议以 `/` 结尾，例如 `http://localhost:8007/`。
- 如果通过同域 Nginx 反代 `/api/`，也可以设置为 `/`。
- `VITE_RUNTIME_API_BASE_URL` 用于 Markdown 转换等 `sapper_server` 接口。
- `VITE_AGENT_API_BASE_URL` 用于生成 Agent 对外调用地址。

## 安装依赖

```bash
cd sapper_web
pnpm install
```

如果没有安装 pnpm：

```bash
npm install -g pnpm
```

## 本地启动

```bash
cd sapper_web
pnpm dev --host 0.0.0.0 --port 8008
```

访问：

```text
http://localhost:8008
```

开发服务器默认使用 HTTP 和 `8008` 端口。生产环境的 HTTPS 建议由 Nginx、Caddy 或 Ingress 终止。

## 常用命令

```bash
# 开发服务器
pnpm dev

# 类型检查并构建
pnpm build

# 仅类型检查
pnpm type-check

# ESLint 检查
pnpm lint

# 预览构建产物
pnpm preview
```

## 页面路由

主要路由定义在 `src/router/index.tsx`。

| 路径 | 说明 |
| --- | --- |
| `/` | 门户首页 |
| `/login` | 登录页 |
| `/register` | 注册页 |
| `/auth/callback` | OAuth 回调页 |
| `/workspace` | 默认工作台 |
| `/workspace/agent` | Agent 工作台列表 |
| `/workspace/agent/:id` | Agent 编辑工作台 |
| `/workspace/agent/:id/publish` | Agent 发布页 |
| `/workspace/knowledge` | 知识库列表 |
| `/workspace/knowledge/:id` | 知识库工作台 |
| `/workspace/plugin` | 插件列表 |
| `/workspace/plugin/:id` | 插件工作台 |
| `/discover` | Agent 市场 |
| `/discover/:tag` | 按标签筛选市场 |
| `/plugins` | 插件市场 |
| `/agent/display/:id` | Agent 展示和使用页 |
| `/usercenter` | 用户中心 |
| `/tutorial` | 教程页 |
| `/case` | 用例页 |

除登录、注册、首页、OAuth 回调等公开页面外，大部分工作台页面会通过 `utils/auth` 检查登录状态，未登录会重定向到 `/login`。

## API 约定

前端 API 封装位于 `src/api/`：

- `src/api/interceptor.ts`：axios 全局配置、Token 注入、响应处理。
- `src/api/auth`：登录、注册、OAuth、验证码。
- `src/api/user`：用户信息、用户状态、头像等。
- `src/api/llm`：LLM 供应商、模型、配置校验。
- `src/api/sapper`：Agent、会话、知识库、插件、发布等核心业务。
- `src/api/upload`：文件上传。
- `src/api/util.ts`：Markdown 转换工具接口。

认证逻辑：

- Token 从 `utils/auth` 读取。
- 请求拦截器会自动设置 `Authorization: Bearer <token>`。
- axios 开启 `withCredentials = true`，后端 CORS 需要允许凭证。
- 后端响应默认按 `{ code, msg, data }` 结构处理，`code !== 200` 会触发错误提示。

## 与后端联调

本地三服务常用端口：

| 服务 | 目录 | 端口 | 说明 |
| --- | --- | ---: | --- |
| `sapper_server` | `sapper_server/` | 8006 | Sapper Chain / RAG / 自定义插件运行时 |
| `sapper_backend` | `sapper_backend/` | 8007 | 管理 API、认证、Agent、知识库、插件等 |
| `sapper_web` | `sapper_web/` | 8008 | 前端应用 |

前端联调配置示例：

```env
VITE_API_BASE_URL=http://localhost:8007/
```

`sapper_backend` 的 CORS 白名单需要包含前端访问源，例如：

```text
http://localhost:8008
```

如果走仓库根目录的 `scripts/start_all.sh`，脚本会用 `screen` 启动三项服务；后端服务使用本地 HTTPS 证书，Vite 开发服务使用 HTTP。

## 开发注意事项

- `src/router/index.tsx` 是页面路由入口。
- `src/stores/index.ts` 组合 Redux store，各业务 slice 位于 `src/stores/*Slice.ts`。
- `src/service/` 封装业务操作，通常调用 `src/api/`。
- `src/components/` 放通用和业务组件，`src/modals/` 放弹窗组件。
- `src/pages/` 放页面级组件。
- Ant Design 中文 locale 在 `src/main.tsx` 的 `ConfigProvider` 中配置。
- Tailwind 样式入口包括 `src/index.css` 和 `src/assets/css/tailwind.css`。
- 新增后端接口时，优先在 `src/api/` 增加请求函数，再在 `src/service/` 和 hooks 中组合业务逻辑。

## 故障排查

- 页面请求后端失败：检查 `VITE_API_BASE_URL` 是否以 `/` 结尾，后端是否在对应端口运行。
- 浏览器提示跨域：检查 `sapper_backend` 的 `CORS_ALLOWED_ORIGINS` 是否包含当前前端源。
- 登录后仍跳转登录页：检查 Token 是否写入浏览器存储，以及 axios 请求头是否带上 `Authorization`。
- Markdown 转换调用失败：检查 `VITE_RUNTIME_API_BASE_URL` 是否指向可访问的 `sapper_server`。

## 安全注意事项

- 不要把真实 API 地址、Token、对象存储密钥或私有证书提交到仓库。
- 私有化部署时移除硬编码线上 API 地址。
- 生产环境应收紧后端 CORS 白名单，不要长期使用 `*`。
- 对外部署时使用 HTTPS，并确认 Cookie、Token 和反向代理头配置一致。
