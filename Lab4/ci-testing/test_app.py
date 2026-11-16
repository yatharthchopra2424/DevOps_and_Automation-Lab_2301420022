#!/usr/bin/env python3
"""
test_app.py — pytest tests for Lab4 Flask app (ci-testing task)
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))

import pytest
from app import app as flask_app

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as c:
        yield c

def test_root_returns_200(client):
    """GET / should return HTTP 200"""
    resp = client.get("/")
    assert resp.status_code == 200

def test_root_has_message(client):
    """GET / JSON body must contain 'message' key"""
    resp = client.get("/")
    data = resp.get_json()
    assert "message" in data

def test_root_has_version(client):
    """GET / JSON body must contain 'version' key"""
    resp = client.get("/")
    data = resp.get_json()
    assert "version" in data

def test_health_returns_200(client):
    """GET /health should return HTTP 200"""
    resp = client.get("/health")
    assert resp.status_code == 200

def test_health_status_is_healthy(client):
    """GET /health must report status healthy"""
    resp = client.get("/health")
    data = resp.get_json()
    assert data.get("status") == "healthy"

def test_root_has_hostname(client):
    """GET / JSON must contain hostname"""
    resp = client.get("/")
    data = resp.get_json()
    assert "hostname" in data

def test_unknown_route_404(client):
    """Unknown route must return 404"""
    resp = client.get("/nonexistent")
    assert resp.status_code == 404
