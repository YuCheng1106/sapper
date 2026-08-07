import re
import markdown
from bs4 import BeautifulSoup
from abc import ABC, abstractmethod
from typing import List


# Abstract base class for chunking strategies
class BaseChunkingStrategy(ABC):
    @abstractmethod
    def chunk(self, text: str) -> List[str]:
        pass


class ChunkToolFacTory:
    def __init__(self):
        self.strategies = {
            "regex": RegexChunking(),
            "markdown": MarkdownChunking(),
            "fixed": FixedLengthWordChunking(),
            "sliding": SlidingWindowChunking(),
            # Add more strategies as needed
        }

    def chunk_file(self, file_path: str, strategy_name: str) -> List[str]:
        strategy = self.strategies.get(strategy_name)
        if strategy is None:
            raise ValueError(f"Strategy {strategy_name} is not supported.")

        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        return strategy.chunk(content)


class RegexChunking:
    def __init__(self, patterns=None, max_chunk_size=300):
        if patterns is None:
            patterns = [r'\n\n']  # Default split pattern
        self.patterns = patterns
        self.max_chunk_size = max_chunk_size

    def chunk(self, text: str) -> List[str]:
        paragraphs = [text]
        # First split by the provided patterns
        for pattern in self.patterns:
            new_paragraphs = []
            for paragraph in paragraphs:
                new_paragraphs.extend(re.split(pattern, paragraph))
            paragraphs = new_paragraphs

        # Then check for chunks that are too large
        final_chunks = []
        for chunk in paragraphs:
            if len(chunk) <= self.max_chunk_size:
                final_chunks.append(chunk)
                continue

            # If chunk is too large, split it further
            start = 0
            while start < len(chunk):
                end = start + self.max_chunk_size
                # Try to find a natural break point near the end
                if end < len(chunk):
                    # Look for the nearest sentence end or whitespace
                    break_pos = chunk.rfind(' ', start, end)
                    if break_pos == -1 or break_pos < start + self.max_chunk_size // 2:
                        # No good break point found, just split at max size
                        break_pos = end
                    end = break_pos

                final_chunks.append(chunk[start:end].strip())
                start = end + 1 if end < len(chunk) else end

        return [chunk for chunk in final_chunks if chunk.strip()]


# Markdown chunking
class MarkdownChunking(BaseChunkingStrategy):
    def __init__(self, patterns=None):
        if patterns is None:
            patterns = [r'\n\n']
        self.patterns = patterns

    def chunk(self, text: str) -> List[str]:
        # Convert Markdown text to HTML
        html = markdown.markdown(text)
        # Parse HTML using BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        # Extract all paragraphs
        paragraphs = soup.find_all('p')
        # Return text of all paragraphs
        return [para.text for para in paragraphs]


# Fixed-length word chunks
class FixedLengthWordChunking(BaseChunkingStrategy):
    def __init__(self, chunk_size=100):
        self.chunk_size = chunk_size

    def chunk(self, text: str) -> List[str]:
        words = text.split()
        return [' '.join(words[i:i + self.chunk_size]) for i in range(0, len(words), self.chunk_size)]


# Sliding window chunking
class SlidingWindowChunking(BaseChunkingStrategy):
    def __init__(self, window_size=512, step=512):
        self.window_size = window_size
        self.step = step

    def chunk(self, text: str) -> List[str]:
        chunks = []
        text_length = len(text)

        for i in range(0, text_length, self.step):
            chunk = text[i:i + self.window_size]
            if chunk:
                chunks.append(chunk)

        return chunks
