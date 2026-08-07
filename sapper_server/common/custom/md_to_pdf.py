"""
Markdown转PDF工具（方案一）
依赖：markdown, pdfkit + wkhtmltopdf
安装：
1. pip install markdown pdfkit
2. 下载安装wkhtmltopdf：https://wkhtmltopdf.org/
"""
import markdown
import pdfkit
import asyncio


async def md_to_pdf(content: str, output_path: str, wkhtml_path: str):
    try:

        # 异步执行Markdown转换
        html_content = await asyncio.to_thread(
            markdown.markdown,
            content,
            extensions=['tables', 'fenced_code', 'codehilite']
        )

        # 转换为HTML（添加中文支持和基础样式）
        html_template = f"""
        <html>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'SimSun'; line-height: 1.6; }}
                code {{ background: #f0f0f0; padding: 2px 5px; }}
            </style>
            <body>
                {html_content}
            </body>
        </html>
        """

        # 配置wkhtmltopdf路径（需根据实际安装位置修改）
        config = pdfkit.configuration(wkhtmltopdf=wkhtml_path)

        # 异步执行转换
        await asyncio.to_thread(
            pdfkit.from_string,
            html_template,
            output_path,
            configuration=config
        )

        return True
    except Exception as e:
        print(f"转换失败: {str(e)}")
        return False
