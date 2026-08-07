from ...data_module.base_module.base_chunker import RegexChunker, SemanticChunker
from .third_party_lib.docling.docling_server import Chunker
import tempfile
import os
import re
#python lib support
class RegexChunkerBasedPythonLib(RegexChunker):
    def __init__(self):
        super(RegexChunkerBasedPythonLib, self).__init__()

    def chunk(self,text):
        paragraphs = [text]
        for pattern in self.patterns:
            new_paragraphs = []
            for paragraph in paragraphs:
                new_paragraphs.extend(re.split(pattern, paragraph))
            paragraphs = new_paragraphs
        return paragraphs

#docling support
class SemanticChunkerBasedDocling(SemanticChunker):
    def __init__(self,model_name, max_size):
        super(SemanticChunkerBasedDocling, self).__init__(model_name, max_size)
        self.chunker = Chunker(model_name,max_size)

    def chunk(self,text):

        with tempfile.NamedTemporaryFile(delete=False, mode='w', suffix='.md', encoding='utf-8') as temp_file:
            temp_file.write(text)
            temp_file_path = temp_file.name

        chunks = self.chunker.chunk(temp_file_path)
        os.remove(temp_file_path)

        return chunks

