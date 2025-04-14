import unittest
from flask import Flask
from app.dublin_bikes_app_flask import app

class TestEdgeCases(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_invalid_station(self):
        response = self.client.get("/dynamic/999999")  # not exist station id
        self.assertIn(response.status_code, [400, 404, 500])

    def test_missing_predict_body(self):
        response = self.client.post("/predict_availability", json={})
        self.assertEqual(response.status_code, 400)
