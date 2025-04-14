import unittest
from unittest.mock import patch
from call_api_function.call_api_single_stations import call_api_single_stations

class TestBikeAPI(unittest.TestCase):
    @patch('call_api_function.call_api_single_stations.requests.get')
    def test_mocked_station_api(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "mainStands": {
                "availabilities": {
                    "bikes": 5,
                    "stands": 8
                }
            },
            "status": "OPEN",
            "lastUpdate": "2024-04-10T14:00:00Z"
        }
        result = call_api_single_stations(42)
        self.assertEqual(result["mainStands"]["availabilities"]["bikes"], 5)
        self.assertEqual(result["status"], "OPEN")
