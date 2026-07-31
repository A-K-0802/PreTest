def test_root_endpoint(client):
    """Test GET / returns welcome message and docs links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["docs"] == "/docs"

def test_health_check_endpoint(client):
    """Test GET /api/v1/health returns healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "DSA Practice Platform API"
