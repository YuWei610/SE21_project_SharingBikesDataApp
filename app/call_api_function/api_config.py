import os
from dotenv import load_dotenv
import sys
sys.path.append('..')
import dbinfo

load_dotenv()

# Load environment variables from the .env file
# load_dotenv()  # It looks for a .env file in the current directory


# BIKE_API_KEY = dbinfo.JCKEY
# CONTRACT = dbinfo.NAME
# WEATHER_API_KEY = "YOUR_API_KEY"  # 使用dublin_bikes_app.js中的OpenWeatherMap API密钥

BIKE_API_KEY = os.getenv("b_apiKey")
CONTRACT = os.getenv("contract")
WEATHER_API_KEY = os.getenv("w_appid")

API_CONFIG = {
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": 53.349805,
            "lon": -6.260310,
            "appid": WEATHER_API_KEY 
        }
    },
    "stations": {
        "apiKey": BIKE_API_KEY,
        "stations_url": "https://api.jcdecaux.com/vls/v1/stations",
        "contract" : CONTRACT
    },
    "single_station": {
        "apiKey": BIKE_API_KEY,
        "single_station_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : CONTRACT
    },
    "stations_v3": {
        "apiKey": BIKE_API_KEY,
        "stations_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : CONTRACT
    }
}
