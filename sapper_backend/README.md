# Sapper Backend

`sapper_backend` 是 Sapper 的管理端 API 服务，负责用户认证、后台管理、智能体配置、知识库管理、文件管理、插件配置、发布管理、LLM 供应商配置以及异步任务调度。服务基于 FastAPI 构建，默认 API 前缀为 `/api/v1`。

启动流程会完成以下工作：

- 检查并安装内置插件依赖。
- 注册 FastAPI 路由、中间件、异常处理和分页组件。
- 初始化数据库表和 Redis 限流器。
- 挂载上传文件静态目录 `/static/upload`。
- 挂载 Socket.IO 服务 `/ws/socket.io`。

## 技术栈

- Python 3.10+
- FastAPI / Uvicorn
- SQLAlchemy async / Alembic
- MySQL 或 PostgreSQL
- Redis
- Celery / Flower
- Socket.IO

## 目录结构

```text
sapper_backend/
├── app/                 # 内置业务模块：admin、task
├── plugin/              # 插件模块：agent、knowledge、file、publish、oauth2 等
├── common/              # 通用枚举、异常、日志、响应模型、Socket.IO 等
├── core/                # 应用配置、路径配置、FastAPI 注册逻辑
├── database/            # 数据库与 Redis 连接
├── middleware/          # 访问日志、JWT、操作日志、状态中间件
├── alembic/             # 数据库迁移脚本目录
├── scripts/             # lint、format、export 等辅助脚本
├── static/              # 静态资源
├── main.py              # ASGI 入口，启动时会检查插件依赖
├── run.py               # IDE 调试入口
├── cli.py               # 命令行能力入口
├── celery-start.sh      # Celery worker、beat、Flower 启动脚本
├── requirements.txt     # Python 依赖
└── .env.example         # 环境变量模板
```

## 前置依赖

本地运行前需要准备：

- Python 3.10 或更高版本
- MySQL 或 PostgreSQL，当前 `.env.example` 默认使用 MySQL
- Redis
- 可选：RabbitMQ，只有 `CELERY_BROKER=rabbitmq` 时需要
- 可选：对象存储 COS，用于文件上传、发布等依赖对象存储的功能

## 环境配置

复制环境变量模板：

```bash
cd sapper_backend
cp .env.example .env
```

至少需要确认以下配置：

```env
ENVIRONMENT='dev'

DATABASE_TYPE='mysql'
DATABASE_HOST='127.0.0.1'
DATABASE_PORT=3306
DATABASE_USER='root'
DATABASE_PASSWORD='123456'
DATABASE_SCHEMA='sapper_dy'

REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD=''
REDIS_DATABASE=0

TOKEN_SECRET_KEY='replace-with-your-secret'
OPERA_LOG_ENCRYPT_SECRET_KEY='replace-with-your-hex-secret'

SAPPER_BACKEND_URL='http://localhost:8007/api/v1/'
SAPPER_SERVER_URL='http://localhost:8006/server/api/v1/'
```

常用配置说明：

| 配置项 | 说明 |
| --- | --- |
| `ENVIRONMENT` | 运行环境，支持 `dev`、`pro` |
| `DATABASE_TYPE` | 数据库类型，支持 `mysql`、`postgresql` |
| `DATABASE_SCHEMA` | 后端使用的数据库名 |
| `REDIS_DATABASE` | 主服务使用的 Redis DB |
| `TOKEN_SECRET_KEY` | JWT 签名密钥，部署前必须更换 |
| `OPERA_LOG_ENCRYPT_SECRET_KEY` | 操作日志敏感字段加密密钥，部署前必须更换 |
| `SAPPER_BACKEND_URL` | 当前管理端 API 服务地址 |
| `SAPPER_SERVER_URL` | `sapper_server` 运行时服务 API 地址 |
| `CELERY_BROKER` | Celery 消息代理，支持 `redis`、`rabbitmq` |

密钥生成示例：

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
python -c "import os; print(os.urandom(32).hex())"
```

不要提交真实 `.env`、数据库密码、OAuth 密钥、对象存储密钥或 Token 密钥。

## 安装依赖

```bash
cd sapper_backend
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

`main.py` 启动时会调用插件依赖检查逻辑，并按插件配置安装额外依赖。首次启动如果网络较慢，可能会停留在“检测插件依赖”阶段。

## 初始化数据库

先创建 `.env` 中配置的数据库，例如 MySQL：

```sql
CREATE DATABASE sapper_dy DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

执行迁移：

```bash
cd sapper_backend
alembic upgrade head
```

应用启动时也会执行 `create_table()` 创建模型表，但生产或协作开发环境建议以 Alembic 迁移为准。

## 启动服务

开发模式：

```bash
cd sapper_backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8007 --reload
```

或使用项目自带调试入口：

```bash
cd sapper_backend
python run.py
```

`run.py` 默认监听 `127.0.0.1:8000`，适合 IDE 断点调试。前后端联调时建议使用 `8007`，并同步修改 `sapper_web` 的 `VITE_API_BASE_URL`。

启动后常用地址：

- Swagger：`http://localhost:8007/docs`
- Redoc：`http://localhost:8007/redoc`
- OpenAPI JSON：`http://localhost:8007/openapi`
- 静态上传资源：`/static/upload`
- Socket.IO：`/ws/socket.io`

## Celery 任务

默认配置支持 Redis 或 RabbitMQ 作为 Celery broker，配置项在 `.env` 与 `core/conf.py` 中。任务位于 `app/task/celery_task`，任务包配置在 `CELERY_TASK_PACKAGES`。

启动 worker、beat 和 Flower：

```bash
cd sapper_backend
source .venv/bin/activate
bash celery-start.sh
```

脚本会启动：

- Celery worker：`celery -A app.task.celery worker -l info -P gevent -c 100`
- Celery beat：`celery -A app.task.celery beat -l info`
- Flower：`http://localhost:8555`，默认账号密码 `admin:123456`

生产环境建议将 worker、beat、Flower 拆成独立进程，并使用进程管理器管理。Flower 默认账号密码仅适合本地调试，部署前必须更换或限制访问。

## 主要 API 模块

默认 API 前缀为 `/api/v1`。

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| Auth | `/api/v1/auth` | 登录、登出、验证码、认证相关接口 |
| Sys | `/api/v1/sys` | 用户、角色、菜单、部门等系统管理 |
| Log | `/api/v1/log` | 登录日志、操作日志 |
| Monitor | `/api/v1/monitor` | Redis、服务器等监控接口 |
| Task | `/api/v1/tasks` | 异步任务接口 |
| LLM | `/api/v1/llm/providers`, `/api/v1/llm/models` | LLM 供应商与模型配置 |
| OAuth2 | `/api/v1/oauth2` | GitHub、LinuxDo、JXNU 登录 |
| Sapper Agent | `/api/v1/sapper/agents` | 智能体管理 |
| Conversation | `/api/v1/sapper/conversations` | 会话管理 |
| Knowledge | `/api/v1/sapper/knowledge-bases` | 知识库管理 |
| File | `/api/v1/sapper/files` | 文件管理 |
| Plugin | `/api/v1/sapper/plugins` | Sapper 插件管理 |
| Publish | `/api/v1/sapper/publications` | 发布管理 |

完整接口以 `/docs` 生成的 OpenAPI 文档为准。

## 插件机制

`plugin/` 目录下的模块会通过 `plugin.tools.build_final_router()` 汇总进 FastAPI。新增或调整插件时，通常需要关注：

- `plugin/<name>/api/router.py`：插件路由入口
- `plugin/<name>/model/`：数据库模型
- `plugin/<name>/schema/`：Pydantic schema
- `plugin/<name>/crud/`：数据库访问
- `plugin/<name>/service/`：业务逻辑
- `plugin/<name>/sql/`：插件初始化 SQL
- `plugin/<name>/requirements.txt`：插件额外依赖

`cli.py` 中保留了插件安装、插件 SQL 执行等命令行能力；如果要正式使用，建议先补齐项目打包入口或修正当前 CLI 导入方式，再将命令纳入发布流程。

## 常用命令

```bash
# 启动 API
uvicorn main:app --host 0.0.0.0 --port 8007 --reload

# 数据库迁移
alembic revision --autogenerate -m "change description"
alembic upgrade head

# 启动 Celery worker/beat/Flower
bash celery-start.sh

# 运行测试
pytest
```

## 开发注意事项

- 配置读取入口为 `core/conf.py`，默认从 `sapper_backend/.env` 加载。
- FastAPI 应用注册入口为 `core/registrar.py`。
- 中间件执行顺序可参考 `register_middleware()`，Starlette 中间件实际执行顺序与添加顺序相关。
- JWT 白名单在 `TOKEN_REQUEST_PATH_EXCLUDE` 中维护。
- CORS 白名单在 `CORS_ALLOWED_ORIGINS` 中维护，源地址末尾不要带斜杠。
- 上传目录由 `core/path_conf.py` 管理，并挂载到 `/static/upload`。
- 演示模式由 `DEMO_MODE` 控制，会对部分接口增加保护。
- 修改接口后建议打开 `/docs` 检查 OpenAPI 是否符合预期。

## 故障排查

- 启动时报 `.env` 配置缺失：检查 `.env.example` 中必填项是否都已复制并填写。
- 数据库连接失败：确认数据库已创建、账号有权限、`DATABASE_TYPE` 与驱动匹配。
- Redis 连接失败：确认 Redis 地址、端口、密码和数据库编号正确。
- 首次启动慢：检查插件依赖安装过程和 pip 源配置，`PLUGIN_PIP_CHINA` 与 `PLUGIN_PIP_INDEX_URL` 可调整插件依赖安装源。
- 前端跨域失败：确认前端地址已加入 `CORS_ALLOWED_ORIGINS`，并且后端服务 URL 与前端环境变量一致。
- `sapper_server` 调用失败：确认 `SAPPER_SERVER_URL` 指向运行中的 `sapper_server`，且路径包含 `/server/api/v1/`。
- 登录或鉴权异常：确认 `TOKEN_SECRET_KEY` 已设置，Redis 可用，浏览器请求头或 Cookie 未被代理层丢弃。

## 安全注意事项

- 部署前更换 `.env.example` 中所有示例密钥。
- 不要把 `.env`、日志、上传文件、证书和对象存储密钥提交到仓库。
- 生产环境关闭或限制 Swagger、Redoc、OpenAPI 暴露范围。
- 根据实际域名收紧 CORS 白名单。
- 对外开放前检查对象存储 bucket、回调地址、OAuth2 redirect URI 和管理后台权限。
