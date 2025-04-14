import unittest
import mysql.connector
from dotenv import load_dotenv, find_dotenv



env_path = find_dotenv()
print("🧭 Using .env from:", env_path)
load_dotenv(dotenv_path=env_path,override=True)

import os


print("🔍 Test env check:")
print("user:", os.getenv("user"))
print("password:", os.getenv("password"))
print("host:", os.getenv("host"))
print("database:", os.getenv("database"))


class TestDB(unittest.TestCase):
    def test_get_station_location(self):
        # Connect to DB
        conn = mysql.connector.connect(
            host=os.getenv("host"),
            user=os.getenv("user"),
            password=os.getenv("password"),
            database=os.getenv("database"),
            port=int(os.getenv("port"))
        )
        cursor = conn.cursor()
        cursor.execute("SELECT position_lat, position_lon FROM station WHERE number = %s", (42,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        self.assertIsNotNone(result)
        self.assertEqual(len(result), 2)  # lat, lon
