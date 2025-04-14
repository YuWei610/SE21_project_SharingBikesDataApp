import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

with patch("joblib.load", return_value=MagicMock()):
    from dublin_bikes_app_flask import app
from flask import json

# Setup the test client
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Test to confirm that the flask application is fetching the static station data correctly.
def test_get_stations(client):
    # Mock the MySQL query result
    mock_data = [
        {'number': 42, 'name': 'Test Station', 'address': 'Test location'}
    ]
    with patch("mysql.connector.connect") as mock_connect:
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = mock_data
        mock_connect.return_value.cursor.return_value = mock_cursor

        response = client.get("/get_stations")
        assert response.status_code == 200
        assert response.json == mock_data

## Function to test that the function will correctly fetch dynamic data from JCDecaux.
def test_dynamic_details_valid(client):
    sample_api_response = {
        "mainStands": {
            "availabilities": {
                "bikes": 5,
                "stands": 10,
                "mechanicalBikes": 3,
                "electricalBikes": 2
            }
        },
        "status": "OPEN",
        "lastUpdate": "2024-04-14T10:00:00Z"
    }

    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = sample_api_response

        response = client.get("/dynamic/123")
        assert response.status_code == 200
        data = response.get_json()
        assert data["available_bikes"] == 5
        assert data["status"] == "OPEN"

# Test to check the functionality of the get_weather_summary function in the flask app.
def test_get_weather_summary(client):
    #mock response.
    mock_weather_data = {
        "current": {
            "temp": 293.15,
            "weather": [{"description": "clear sky"}]
        }
    }
    
    with patch("requests.get") as mock_get:

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_weather_data
        
        response = client.get('/get_weather_summary')

        assert response.status_code == 200
        data = response.get_json()

        expected_summary = "Dublin: 20.0°C, Clear sky"
        assert data["summary"] == expected_summary

## function to check for a test failure. This ensures that the testing it not only giving us positive results.
def test_dynamic_details_invalid_station(client):
    # Simulate failure or empty response.
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 404
        mock_get.return_value.json.return_value = {}

        response = client.get("/dynamic/999999")
        assert response.status_code == 200  
        data = response.get_json()
        assert "available_bikes" in data  