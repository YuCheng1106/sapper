from ....base.manager import BaseMemoryManager
from ....data_model.memory import LongMemory, ShortMemory
from ....data_model.agent import Agent
from pydantic import validate_call

class ShortMemoryManager(BaseMemoryManager):
    def __init__(self, short_memory):
        super(ShortMemoryManager, self).__init__()
        self.short_memory = self.__init_short_memory(short_memory)
        self.memory_limit = 10
    @validate_call
    def __init_short_memory(self, short_memory: ShortMemory):
        return short_memory

    def update_short_memory(self, chat_records, updated_parameters):
        self.short_memory.parameters = updated_parameters
        self.short_memory.chat_history.extend(chat_records)

    def clear_short_memory(self):
        self.short_memory.chat_history = self.short_memory.chat_history[self.memory_limit:]

    def check_memory_state(self):
        if len(self.short_memory.chat_history) == 0:
            return "normal"
        elif len(self.short_memory.chat_history) >= self.memory_limit:
            return "overloading"
        else:
            pass

class LongMemoryManager(BaseMemoryManager):
    def __init__(self, long_memory):
        super(LongMemoryManager, self).__init__()
        self.long_memory = self.__init_long_memory(long_memory)

    @validate_call
    def __init_long_memory(self, long_memory: LongMemory):
        return long_memory

    def summary_preference(self):
        pass

    def update_memory(self, preference, knowledge_collections, APIs):
        self.long_memory.preference = preference
        self.long_memory.knowledge_collections = knowledge_collections
        self.long_memory.APIs = APIs

    def clear_long_memory(self):
        self.long_memory.preference = None
        self.long_memory.knowledge_collections = None
        self.long_memory.APIs = None

