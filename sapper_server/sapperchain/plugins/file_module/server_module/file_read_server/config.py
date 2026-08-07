import argparse
from file_module.base_module.base import FileReader
from file_module.function_module.file_reader import PdfReaderBasedDocling, DocxReaderBasedDocling, TxtReaderBasedPythonLib, CsvReaderBasedPythonLib, PptxReaderBasedDocling
import mcp.types as types
parser = argparse.ArgumentParser(description='file convert server')
parser.add_argument("--tools", type=list[types.Tool], default=[
            types.Tool(
                name="read_pdf_file",
                description="read content from upload pdf file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                    },
                    "required": ["file_path"]
                }
            ),
            types.Tool(
                name="read_doc_file",
                description="read content from upload doc file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                    },
                    "required": ["file_path"]
                }
            ),
            types.Tool(
                name="read_txt_file",
                description="read content from upload txt file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                    },
                    "required": ["user_input"]
                }
            ),
            types.Tool(
                name="read_csv_file",
                description="read content from upload csv file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                    },
                    "required": ["user_input"]
                }
            ),
            types.Tool(
                name="read_ppt_file",
                description="read content from upload ppt file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                    },
                    "required": ["file_path"]
                }
            )
        ], help='Radius of cylinder')
parser.add_argument("--pdf_reader",type=FileReader,default=PdfReaderBasedDocling())
parser.add_argument("--doc_reader",type=FileReader,default=DocxReaderBasedDocling())
parser.add_argument("--txt_reader",type=FileReader,default=TxtReaderBasedPythonLib())
parser.add_argument("--csv_reader",type=FileReader,default=CsvReaderBasedPythonLib())
parser.add_argument("--ppt_reader",type=FileReader,default=PptxReaderBasedDocling())
args = parser.parse_args()







