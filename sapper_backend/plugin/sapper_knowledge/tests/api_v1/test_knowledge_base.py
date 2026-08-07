#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from starlette.testclient import TestClient


def test_create_knowledge_base(client: TestClient, token_headers: dict[str, str]) -> None:
    data = {
        'name': '数学老师插件',
        'description': '<UNK>',
        'status': 1,
        'creator_id': 1,
    }
    response = client.post('/sapper/knowledge-bases', headers=token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_correct_create_knowledge_base(client: TestClient, correct_token_headers: dict[str, str]) -> None:
    data = {
        'name': '数学老师插件',
        'description': '<UNK>',
        'status': 1,
        'creator_id': 2,
    }

    response = client.post('/sapper/knowledge-bases', headers=correct_token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_update_knowledge_base(client: TestClient, correct_token_headers: dict[str, str]) -> None:
    data = {
        'name': '数老师',
        'description': '<UNK>',
        'cover_image': 'https://example.com',
    }
    response = client.put('/sapper/knowledge-bases/2', headers=correct_token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_get_knowledge_base_page(client: TestClient, token_headers: dict[str, str], correct_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/knowledge-bases', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/knowledge-bases', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/knowledge-bases', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/knowledge-bases', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))


def test_get_knowledge_base(client: TestClient, token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/knowledge-bases/1', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())


def test_correct_user_get_knowledge_base(client: TestClient, correct_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/knowledge-bases/3', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())


def test_normal_user_get_knowledge_base(client: TestClient, normal_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/knowledge-bases/3', headers=normal_token_headers)
    assert response.status_code == 403
    assert response.json()['code'] == 403
    print(response.json())


def test_delete_knowledge_base(client: TestClient, normal_token_headers: dict[str, str]) -> None:
    """测试批量删除智能体"""
    # 准备测试数据
    data = {
        'pks': [1]
    }

    # 发送DELETE请求（注意：虽然不常见，但FastAPI支持DELETE请求带body）
    response = client.request(
        'DELETE',
        '/sapper/knowledge-bases',
        headers=normal_token_headers,
        json=data
    )

    # 验证响应
    assert response.status_code == 200
    assert response.json()['code'] == 200

