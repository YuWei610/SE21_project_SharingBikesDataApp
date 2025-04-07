import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()  # It looks for a .env file in the current directory

# Retrieve specific values from environment variables
WEATHER_API_KEY = os.getenv("w_appid")      # Weather API key
BIKE_API_KEY = os.getenv("b_apiKey")        # JCDecaux Bike API key
CONTRACT = os.getenv("contract")            # City contract name, e.g., "dublin"



API_CONFIG = {
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": 33.44,
            "lon": -94.04,
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
