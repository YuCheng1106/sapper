# app/admin/tests/api_v1/test_auth.py
from starlette.testclient import TestClient

def test_logout(client: TestClient, token_headers: dict[str, str]) -> None:
    response = client.post('/auth/logout', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200


def test_get_agent_page(client: TestClient, token_headers: dict[str, str]) -> None:
    response = client.get('/sys/users', headers=token_headers)
    assert response.status_code == 200
    assert response.json()['code'] == 200
    print(response.json())
