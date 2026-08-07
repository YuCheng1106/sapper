import argparse
from file_module.base_module.base import FileTypeConverter
from file_module.function_module.file_type_converter import PdfConverterBasedDocling,DocxConverterBasedDocling
import mcp.types as types
parser = argparse.ArgumentParser(description='file convert server')
parser.add_argument("--tools", type=list[types.Tool], default=[
            types.Tool(
                name="convert_pdf_to",
                description="convert source file type (pdf) to target file type",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                        "converted_file_type": {"type": "string"}
                    },
                    "required": ["file_path", "converted_file_type"]
                }
            ),
            types.Tool(
                name="convert_doc_to",
                description="convert source file type (doc) to target file type",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                        "converted_file_type": {"type": "string"}
                    },
                    "required": ["file_path", "converted_file_type"]
                }
            )
        ], help='Radius of cylinder')
parser.add_argument("--pdf_converter",type=FileTypeConverter,default=PdfConverterBasedDocling())
parser.add_argument("--doc_converter",type=FileTypeConverter,default=DocxConverterBasedDocling())

args = parser.parse_args()







