# Sapper Server

`sapper_server` 是 Sapper 的运行时服务，负责 Sapper Chain、Sapper RAG、自定义插件能力和文件转换能力。它通常由 `sapper_backend` 调用，也可以作为独立 FastAPI 服务运行。

默认 API 前缀为 `/server/api/v1`。

## 主要能力

- Sapper Chain：根据需求生成 SPL 表单、生成 SPL Chain、执行 Agent 对话、生成头像、生成会话名称。
- Sapper RAG：读取远程文件、文本分块、内容向量化、文件向量化。
- 自定义插件：图片转文本、Markdown 转图片、Markdown 转 PDF、Markdown 转 DOCX。
- 静态文件服务：挂载 `/server/static` 和 `/server/files`。
- OpenAI 兼容模型调用：通过 `OPENAI_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 配置模型服务。

## 技术栈

- Python 3.10+
- FastAPI / Uvicorn
- Pydantic Settings
- Redis
- OpenAI SDK / OpenAI-compatible API
- Torch / Transformers
- wkhtmltopdf / wkhtmltoimage
- python-docx / PyMuPDF / python-pptx

## 目录结构

```text
sapper_server/
├── app/                 # API、schema、服务编排
├── common/              # 通用模型、工具、文件上传、TTS、图像能力等
├── core/                # 配置、路径、应用注册、安全相关代码
├── middleware/          # JWT、状态、访问日志、操作日志中间件
├── public_tech_lib/     # 公共技术库与外部服务配置
├── sapperchain/         # Sapper Chain 核心逻辑与插件模块
├── sapperrag/           # RAG、分块、向量化、GraphRAG 相关实现
├── static/              # 静态资源
├── templates/           # HTML 模板
├── test/                # 测试与调用样例
├── utils/               # 健康检查、OpenAPI、Redis、时间等工具
├── main.py              # FastAPI 应用入口
├── requirements.txt     # Python 依赖
└── .env.template        # 环境变量模板
```

## 前置依赖

本地运行前需要准备：

- Python 3.10 或更高版本
- Redis
- OpenAI 兼容模型 API Key 和 Base URL
- 本地 embedding 模型目录，用于 `/sapperrag/content-embedding`、`/sapperrag/embedding`
- `wkhtmltopdf` 和 `wkhtmltoimage`，用于 Markdown 转 PDF/图片
- 可选：MySQL、RabbitMQ、COS 对象存储，取决于你启用的功能

## 环境配置

复制环境变量模板：

```bash
cd sapper_server
cp .env.template .env
```

至少需要确认以下配置：

```env
ENVIRONMENT='dev'

MYSQL_HOST='127.0.0.1'
MYSQL_PORT=3306
MYSQL_USER='root'
MYSQL_PASSWORD='replace-with-password'
MYSQL_DATABASE='virtual_teacher'

REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD=''
REDIS_DATABASE=0

TOKEN_SECRET_KEY='replace-with-your-secret'
OPERA_LOG_ENCRYPT_SECRET_KEY='replace-with-your-hex-secret'

OPENAI_MODEL='gpt-4o'
OPENAI_KEY='replace-with-your-openai-compatible-key'
OPENAI_KEY_LIST='["replace-with-your-openai-compatible-key"]'
OPENAI_BASE_URL='https://api.openai.com/v1'
DOUBAO_KEY='replace-with-your-doubao-key'

SECRET_ID=''
SECRET_KEY=''
REGION=''

WKHTMLTOPDF='/usr/local/bin/wkhtmltopdf'
WKHTMLTOIMAGE='/usr/local/bin/wkhtmltoimage'
EMBEDDING_MODEL_PATH='/absolute/path/to/embedding/model'
PUBLIC_FILE_URL='http://localhost:8006/server/files'
```

说明：

- `.env.template` 中的 Key、密码、模型地址都只能作为示例，部署前必须替换。
- `OPENAI_BASE_URL` 需要兼容 OpenAI Chat Completions / Responses 使用方式，具体取决于调用模块。
- `OPENAI_KEY_LIST` 会被部分 RAG CLI 读取为 JSON 字符串，建议保留 JSON 数组格式。
- `DOUBAO_KEY` 在生成 SPL Chain 的流程中会被读取。
- `EMBEDDING_MODEL_PATH` 是本地 embedding 模型路径，缺失会导致向量化接口失败。
- `PUBLIC_FILE_URL` 应指向 `/server/files` 对外可访问地址，用于返回 Markdown 转换后的文件 URL。
- `WKHTMLTOPDF`、`WKHTMLTOIMAGE` 在 Linux 上通常是 `/usr/local/bin/...` 或 `/usr/bin/...`，Windows 示例路径不能直接用于 Linux 部署。

密钥生成示例：

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
python -c "import os; print(os.urandom(32).hex())"
```

## 安装依赖

```bash
cd sapper_server
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

如果需要 Markdown 转 PDF 或图片，安装系统依赖：

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y wkhtmltopdf
```

如果使用 OCR、文档解析或本地模型能力，还需要确保系统中有对应运行时依赖和模型文件。

## 启动服务

开发模式：

```bash
cd sapper_server
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8006 --reload
```

也可以直接运行入口文件：

```bash
python main.py
```

`main.py` 直接运行时默认监听 `8005`；仓库根目录的 `scripts/start_all.sh` 使用 `8006`。联调时建议统一使用 `8006`。

常用访问地址：

- Swagger：`http://localhost:8006/docs`
- 静态资源：`http://localhost:8006/server/static`
- 生成文件：`http://localhost:8006/server/files`
- API 前缀：`http://localhost:8006/server/api/v1`

## API 模块

所有业务接口都挂在 `/server/api/v1` 下。

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| Health | `/health/proxy` | 代理与服务健康检查 |
| Health Stream | `/health/stream` | NDJSON 流式健康检查 |
| Sapper Chain | `/sapperchain/generate-spl-form` | 根据需求生成 SPL 表单，流式返回 |
| Sapper Chain | `/sapperchain/generate-spl-chain` | 根据 Agent 类型和 SPL 表单生成 Chain，流式返回 |
| Sapper Chain | `/sapperchain/generate-answer` | 执行 Agent 对话，流式返回 |
| Sapper Chain | `/sapperchain/generate-avatar` | 根据需求生成头像信息，流式返回 |
| Sapper Chain | `/sapperchain/generate-conversation-name` | 根据 Query 生成会话名称，流式返回 |
| Sapper RAG | `/sapperrag/read` | 下载并解析远程文件 |
| Sapper RAG | `/sapperrag/chunk` | 下载文件、读取内容并分块 |
| Sapper RAG | `/sapperrag/embedding` | 下载文件、读取、分块并向量化 |
| Sapper RAG | `/sapperrag/content-embedding` | 对传入文本内容向量化 |
| Custom Plugin | `/custom-plugin/image-2-text` | 图片转文本 |
| Custom Plugin | `/custom-plugin/markdown-2-image` | Markdown 转图片 |
| Custom Plugin | `/custom-plugin/markdown-2-pdf` | Markdown 转 PDF |
| Custom Plugin | `/custom-plugin/markdown-2-docx` | Markdown 转 DOCX |

完整请求体和响应结构以 Swagger 文档为准。

## 请求示例

文本向量化：

```bash
curl -X POST http://localhost:8006/server/api/v1/sapperrag/content-embedding \
  -H 'Content-Type: application/json' \
  -d '{"content":"Sapper 是一个 Agent 运行平台"}'
```

远程文件解析：

```bash
curl -X POST http://localhost:8006/server/api/v1/sapperrag/read \
  -H 'Content-Type: application/json' \
  -d '{"file_url":"https://example.com/demo.pdf"}'
```

Markdown 转 PDF：

```bash
curl -X POST http://localhost:8006/server/api/v1/custom-plugin/markdown-2-pdf \
  -H 'Content-Type: application/json' \
  -d '{"content":"# Hello\n\nThis is a PDF."}'
```

健康检查：

```bash
curl http://localhost:8006/server/api/v1/health/proxy
```

## 与其他服务联调

`sapper_backend` 通过环境变量 `SAPPER_SERVER_URL` 调用本服务。常见本地配置：

```env
SAPPER_SERVER_URL='http://localhost:8006/server/api/v1/'
```

仓库根目录的 `scripts/start_all.sh` 会以 `screen` 启动：

- `sapper_server`：`8006`
- `sapper_backend`：`8007`
- `sapper_web`：`8008`

该脚本默认使用 Conda 环境 `sapper_server`，并为两个后端服务加载 `ssl/sapperapi` 下的证书；前端开发服务使用 HTTP。

## 开发注意事项

- FastAPI 应用注册入口在 `core/registrar.py`。
- 路由汇总入口在 `app/api/router.py`。
- 全局配置读取入口在 `core/conf.py`，默认读取 `sapper_server/.env`。
- 自定义插件额外配置在 `app/conf.py`，包括 `WKHTMLTOPDF`、`WKHTMLTOIMAGE`、`EMBEDDING_MODEL_PATH`、`PUBLIC_FILE_URL`。
- 文件输出目录是 `sapper_server/files`，服务挂载为 `/server/files`。
- 静态目录是 `sapper_server/static`，服务挂载为 `/server/static`。
- 当前 `core/registrar.py` 中部分数据库、Redis limiter、操作日志中间件初始化逻辑处于注释状态，启用前需要同步检查依赖和配置。
- CORS 在 `core/conf.py` 和 `core/registrar.py` 都有配置痕迹，调整跨域时需要一起检查。

## 故障排查

- 启动时报缺少环境变量：检查 `.env` 是否包含 `DOUBAO_KEY`、`SECRET_ID`、`SECRET_KEY`、`REGION`、`EMBEDDING_MODEL_PATH`、`PUBLIC_FILE_URL` 等模板未完整覆盖的字段。
- 模型调用失败：检查 `OPENAI_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 是否匹配你的模型服务。
- 向量化接口失败：确认 `EMBEDDING_MODEL_PATH` 指向有效本地模型目录，且模型依赖已安装。
- Markdown 转 PDF/图片失败：确认 `WKHTMLTOPDF` 和 `WKHTMLTOIMAGE` 是当前运行环境内真实可执行路径。
- 返回文件 URL 无法访问：确认 `PUBLIC_FILE_URL` 指向当前服务的 `/server/files`，并检查反向代理路径。
- 远程文件读取失败：确认 `file_url` 是 `http://` 或 `https://` 地址，服务所在机器能访问该 URL。
- 端口混乱：直接 `python main.py` 是 `8005`，推荐 `uvicorn ... --port 8006`。

## 安全注意事项

- 立即替换 `.env.template` 中所有示例密钥、密码和模型 API Key。
- 不要提交 `.env`、模型密钥、对象存储密钥、生成文件或日志。
- 对外部署时限制 Swagger、OpenAPI、Flower 或调试端点的公开访问。
- 收紧 CORS 白名单，只保留实际前端域名。
- Markdown 转换和远程文件读取会处理外部输入，生产环境应增加文件类型、大小、下载超时和访问域名限制。
