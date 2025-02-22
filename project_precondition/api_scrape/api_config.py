

API_CONFIG = {
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": 33.44,
            "lon": -94.04,
            "appid": "70450CF782D602A647A20873C8FB5FD4"
        }
    },
    "stations": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "stations_url": "https://api.jcdecaux.com/vls/v1/stations",
        "contract" : "dublin"
    },
    "single_station": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "single_station_url": "https://api.jcdecaux.com/vls/v3/stations/6",
        "contract" : "dublin"
    },
    "parks": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "parks_url": "https://api.jcdecaux.com/parking/v1/contracts/dublin/parks"
    },
    "psrk_info": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "park_info_url": "https://api.jcdecaux.com/parking/v1/contracts/dublin/parks/{park_number}"
    },
        "stations_v3": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "stations_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : "dublin"
    }
}