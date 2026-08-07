import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from abc import ABC,abstractmethod


class SearchExpFromRep(ABC):
    def __init__(self,Exp,Search_Field, Use_field,UseTemplate):
        self.Exp = Exp
        self.Search_Field = Search_Field
        self.Use_field = Use_field
        self.UseTemplate = UseTemplate
    @abstractmethod
    def SearchExp(self,Request):
        pass


class Cosine_SearchExpFromRep(SearchExpFromRep):
    def __init__(self, Exp, Search_Field, Use_Filed, UseTemplate):
        super(Cosine_SearchExpFromRep, self).__init__(Exp, Search_Field, Use_Filed, UseTemplate)

    def SearchExp(self,Request):
        Exp = []
        ExpText = ""
        if(self.Exp != ''):
            print(self.Exp)
            df = pd.read_csv(self.Exp)
            similarity_scores = []
            for index, row in df.iterrows():
                row_similarity = -1
                Search = ""
                for search_field in self.Search_Field:
                    Search += str(row[search_field])
                tfidf_vectorizer = TfidfVectorizer()
                tfidf_matrix = tfidf_vectorizer.fit_transform([Request, str(Search)])
                similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
                similarity = similarity_matrix[0][0]
                if similarity > row_similarity:
                    row_similarity = similarity
                similarity_scores.append((row_similarity, row))
            similarity_scores.sort(key=lambda x: x[0], reverse=True)
            top_three_similar_rows = similarity_scores[:4]
            for i, (score, row) in enumerate(top_three_similar_rows):
                temp_text = self.UseTemplate
                for field in self.Use_field:
                    replace_filed = "{{" + field + "}}"
                    temp_text = temp_text.replace(replace_filed, str(row[field]))
                Exp.append(temp_text)
                ExpText += ''


        JsonExp = {
                "sectionId": '-1',
                "sectionType": "Experience",
                "section":[
                    {
                    "subSectionId":"S1",
                    "subSectionType": "Experience",
                    "content": Exp
                    }
                ]
            }

        return JsonExp
