

API_CONFIG = {
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": 33.44,
            "lon": -94.04,
            "appid": "YOUR_API_KEY"
        }
    },
    "stations": {
        "apiKey": "YOUR_API_KEY",
        "stations_url": "https://api.jcdecaux.com/vls/v1/stations",
        "contract" : "dublin"
    },
    "single_station": {
        "apiKey": "YOUR_API_KEY",
        "single_station_url": "https://api.jcdecaux.com/vls/v3/stations/6",
        "contract" : "dublin"
    },
    "parks": {
        "apiKey": "YOUR_API_KEY",
        "parks_url": "https://api.jcdecaux.com/parking/v1/contracts/dublin/parks"
    },
    "psrk_info": {
        "apiKey": "YOUR_API_KEY",
        "park_info_url": "https://api.jcdecaux.com/parking/v1/contracts/dublin/parks/{park_number}"
    },
        "stations_v3": {
        "apiKey": "YOUR_API_KEY",
        "stations_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : "dublin"
    }
}
