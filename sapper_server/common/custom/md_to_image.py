import asyncio
import markdown
import imgkit


async def md_to_image(content: str, output_path: str, wkhtml_path: str):
    """
    异步将Markdown文件转换为图片
    :param wkhtml_path: wkhtmltoimage可执行文件路径
    :param content: markdown 文本
    :param output_path: 输出图片路径
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

        # 配置转换选项（异步执行）
        config = imgkit.config(wkhtmltoimage=wkhtml_path)
        options = {
            'quality': 100,
            'encoding': "UTF-8",
            'enable-local-file-access': None
        }

        # 异步执行图片转换
        await asyncio.to_thread(
            imgkit.from_string,
            html_template,
            output_path,
            options=options,
            config=config
        )

        return True
    except Exception as e:
        print(f"转换失败: {str(e)}")
        return False


# async def main():
#     """测试用例"""
#     result = await markdown_to_image(
#         input_path="input.md",
#         output_path="output.jpg",
#         wkhtmltoimage_path=r"D:\software\wkhtmltopdf\bin\wkhtmltoimage.exe"
#     )
#
#     if result:
#         print("转换成功！")
#         # 可以在这里添加后续处理逻辑...
#     else:
#         print("转换失败")
#
#
# if __name__ == "__main__":
#     asyncio.run(main())
