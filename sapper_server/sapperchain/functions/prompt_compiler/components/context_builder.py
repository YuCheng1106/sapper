from ....utils.match import parse_refParameter, match_refParam
from ....utils.data import duplicate_removal

class ContextBuilder():
    def __init__(self):
        pass
#
    async def build_context(self, spl_prompt):
        param_context = []
        params = match_refParam(spl_prompt)
        for param in params:
            param_id, = parse_refParameter(param).groups()
            param_context.append(param_id)
        return duplicate_removal(param_context)