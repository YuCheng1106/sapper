import requests
import json
import time


def create_video_task():
    """创建视频生成任务"""
    url = "https://api.example.com/kling/v1/videos/text2video"

    payload = json.dumps({
        "model_name": "kling-v1-6",
        "prompt": "20岁的女生，瓜子脸，五官精致，鹅蛋脸，甩着头发",
        "mode": "std",
        "aspect_ratio": "1:1",
        "duration": "5"
    })

    headers = {
        'Authorization': 'Bearer replace-with-your-test-token',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(url, headers=headers, data=payload, timeout=30)
        response.raise_for_status()  # 如果状态码不是200，抛出异常

        result = response.json()
        print("任务创建响应:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        # 返回任务ID
        if 'data' in result and 'task_id' in result['data']:
            return result['data']['task_id']
        else:
            print("未找到任务ID")
            return None

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {e}")
        return None


def get_video_result(task_id):
    """获取视频生成结果"""
    if not task_id:
        print("任务ID无效")
        return

    url = f"https://api.example.com/kling/v1/videos/text2video/{task_id}"

    headers = {
        'Authorization': 'Bearer replace-with-your-test-token'
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()
        print("\n任务结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        return result

    except requests.exceptions.RequestException as e:
        print(f"获取结果失败: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {e}")
        return None


def main():
    """主函数"""
    # 1. 创建视频生成任务
    print("正在创建视频生成任务...")
    task_id = create_video_task()

    if not task_id:
        print("任务创建失败，程序退出")
        return

    print(f"\n任务创建成功，任务ID: {task_id}")

    # 2. 等待一段时间后获取结果（视频生成需要时间）
    while True:
       print("\n等待视频生成中...")
       time.sleep(10)  # 等待10秒

       # 3. 获取视频生成结果
       result = get_video_result(task_id)

       # 可以根据需要添加轮询逻辑，持续检查任务状态
       if result and result.get('data', {}).get('status') not in ['SUCCESS', 'FAILED']:
           print("\n视频仍在生成中，可以稍后再次查询...")
       else:
          break


if __name__ == "__main__":
    main()
