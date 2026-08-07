import pendulum

def get_iso8601_timestamp():
    """返回当前时间的 ISO 8601 格式字符串"""
    return pendulum.now().to_iso8601_string()


def humanize_time_diff(start_iso8601, end_iso8601):
    """返回人性化的时间差描述（如 '5分钟'）"""
    start = pendulum.parse(start_iso8601)
    end = pendulum.parse(end_iso8601)
    return (end - start).in_words(locale="zh")  # 中文输出
