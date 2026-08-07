from xpinyin import Pinyin

p = Pinyin()

def chinese_to_pinyin_x(text, tone=True, splitter=' '):
    if tone:
        return p.get_pinyin(text, splitter=splitter)
    else:
        return p.get_pinyin(text, splitter=splitter, tone_marks='numbers')