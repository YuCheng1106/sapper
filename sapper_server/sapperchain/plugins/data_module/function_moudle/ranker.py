from ..base_module.base_ranker import BaseFieldRanker


class FieldRanker(BaseFieldRanker):
    def __init__(self):
        super(FieldRanker, self).__init__()

    def rank(self, data):
        data.sort(
            key= self.rank_field,
            reverse=True,
        )
        return data

