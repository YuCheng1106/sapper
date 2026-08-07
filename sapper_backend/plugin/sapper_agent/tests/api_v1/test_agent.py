#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from starlette.testclient import TestClient


def test_create_agent(client: TestClient, token_headers: dict[str, str]) -> None:
    data = {
        'name': '数学老师',
        'description': '<UNK>',
        'cover_image': 'https://example.com',
        'type': 1,
        'status': 1,
        'creator_id': 1,
    }
    response = client.post('/sapper/agents', headers=token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_update_agent(client: TestClient, correct_token_headers: dict[str, str]) -> None:
    data = {
        'name': '数老师',
        'description': '<UNK>',
        'cover_image': 'https://example.com',
        'tags': ['<UNK>', '<UNK>'],
    }
    response = client.put('/sapper/agents/2', headers=correct_token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_agent_add_plugin(client: TestClient, token_headers: dict[str, str]) -> None:
    data = {
        'plugins': [ 1],
    }
    response = client.put('/sapper/agents/3', headers=token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_agent_add_knowledge_base(client: TestClient, token_headers: dict[str, str]) -> None:
    data = {
        'knowledge_bases': [1],
    }
    response = client.put('/sapper/agents/3', headers=token_headers, json=data)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_get_agent_page(client: TestClient, token_headers: dict[str, str], correct_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/agents', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/agents', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/agents', headers=correct_token_headers, params={'discover': True})
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))

    response = client.get('/sapper/agents', headers=correct_token_headers, params={'discover': True, 'tags': ['education']})
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json().get('data'))
    print(len(response.json().get('data').get('items')))


def test_get_agent(client: TestClient, token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/agents/1', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())


def test_correct_user_get_agent(client: TestClient, correct_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/agents/3', headers=correct_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())


def test_normal_user_get_agent(client: TestClient, normal_token_headers: dict[str, str]) -> None:
    response = client.get('/sapper/agents/1', headers=normal_token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())


def test_delete_agent(client: TestClient, normal_token_headers: dict[str, str]) -> None:
    """测试批量删除智能体"""
    # 准备测试数据
    data = {
        'pks': [1]
    }

    # 发送DELETE请求（注意：虽然不常见，但FastAPI支持DELETE请求带body）
    response = client.request(
        'DELETE',
        '/sapper/agents',
        headers=normal_token_headers,
        json=data
    )

    # 验证响应
    assert response.status_code == 200
    assert response.json()['code'] == 200

