import uuid

from fastapi.testclient import TestClient

from app.core.config import settings


def test_create_and_list_workspaces(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
) -> None:
    create_response = client.post(
        f"{settings.API_V1_STR}/workspaces",
        headers=normal_user_token_headers,
        json={"name": "Investigación test"},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == "Investigación test"

    list_response = client.get(
        f"{settings.API_V1_STR}/workspaces",
        headers=normal_user_token_headers,
    )
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["count"] >= 1


def test_sync_workspaces(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
) -> None:
    workspace_id = str(uuid.uuid4())
    sync_body = {
        "schema_version": 1,
        "active_workspace_id": workspace_id,
        "workspaces": [
            {
                "id": workspace_id,
                "name": "Sync remoto",
                "schema_version": 1,
                "updated_at": "2026-06-03T12:00:00+00:00",
                "graph": {"nodes": [], "edges": [], "viewport": None},
                "server_revision": None,
            }
        ],
    }

    put_response = client.put(
        f"{settings.API_V1_STR}/workspaces/sync",
        headers=normal_user_token_headers,
        json=sync_body,
    )
    assert put_response.status_code == 200
    synced = put_response.json()
    assert synced["active_workspace_id"] == workspace_id
    assert len(synced["workspaces"]) == 1

    get_response = client.get(
        f"{settings.API_V1_STR}/workspaces/sync",
        headers=normal_user_token_headers,
    )
    assert get_response.status_code == 200
    assert get_response.json()["workspaces"][0]["name"] == "Sync remoto"
