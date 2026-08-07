import json

import requests


def query_weather(city="北京"):
    """
    根据城市查询天气
    """
    url = "https://apis.juhe.cn/simpleWeather/query"

    params = {
        "city": city,
        "key": "8ecd33942d9fdb7553a74a40e82e990a"
    }

    headers = {
        "User-Agent": "Coze/1.0",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None


# 使用示例
if __name__ == "__main__":
    # 查询北京天气
    result = query_weather("北京")
    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))

    # 查询上海天气
    result = query_weather("上海")
    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))