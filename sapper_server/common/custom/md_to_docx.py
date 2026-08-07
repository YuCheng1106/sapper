import asyncio
import markdown
from docx import Document
from htmldocx import HtmlToDocx


async def md_to_docx(content: str, output_path: str):
    """
    将Markdown文件转换为Word文档

    参数：
    content (str): 输入的Markdown内容
    output_path (str): 输出的Word文件路径
    """
    try:
        # 异步执行Markdown转换
        html_content = await asyncio.to_thread(
            markdown.markdown,
            content,
            extensions=['tables', 'fenced_code', 'codehilite']
        )

        # 构建完整HTML
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }}
                pre {{ background: #f8f9fa; padding: 15px; border-radius: 5px; }}
                table {{ border-collapse: collapse; margin: 15px 0; }}
                th, td {{ padding: 8px; border: 1px solid #ddd; }}
            </style>
        </head>
        <body>{html_content}</body>
        </html>
        """

        # 创建新Word文档
        doc = Document()

        # 初始化HTML转换器
        html_parser = HtmlToDocx()

        # 添加HTML内容到文档
        html_parser.add_html_to_document(html_content, doc)

        # 异步保存文档
        await asyncio.to_thread(doc.save, output_path)
        print(f"转换成功！文件已保存至：{output_path}")
        return True
    except Exception as e:
        print(f"转换过程中发生错误：{str(e)}")
        return False
