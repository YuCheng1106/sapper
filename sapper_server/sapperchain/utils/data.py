

def duplicate_removal(data):
    return list(set(data))


def split_json_objects(s):
    stack = []
    parts = []  # 存储分割后的JSON字符串
    start_index = 0  # 记录每个JSON对象的起始位置

    for i, char in enumerate(s):
        if char == '{':
            stack.append(char)  # 遇到左括号入栈
        elif char == '}':
            if stack:
                stack.pop()  # 遇到右括号出栈
            else:
                raise ValueError("多余的右括号 at index {}".format(i))

            # 栈空时表示一个完整JSON对象结束
            if not stack:
                parts.append(s[start_index:i + 1])
                start_index = i + 1  # 下一个对象起始位置

    # 最终检查栈是否为空
    if stack:
        raise ValueError("括号未闭合")

    return parts

def calculate_string_len(text):
    return len(str(text))


def add(number_1, number_2):
    return number_1+number_2