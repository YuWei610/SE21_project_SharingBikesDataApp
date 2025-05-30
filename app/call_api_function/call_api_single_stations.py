####################DOWNLOAD from JCDECAUX###############
import requests
import traceback
import datetime
import time
import sys
import os
import pandas as pd
# import api_config
from . import api_config

"""
api_config.API_CONFIG:
    "single_station": {
        "apiKey": BIKE_API_KEY ,
        "single_station_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : CONTRACT
    },
"""

def call_api_single_stations(station_id):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        base_url = api_config.API_CONFIG["stations_v3"]["stations_url"]
        url = f"{base_url}/{station_id}"
        r = requests.get(url , params={"apiKey": api_config.API_CONFIG["stations_v3"]["apiKey"], "contract": api_config.API_CONFIG["stations_v3"]["contract"]}, headers=headers)
        print(r.status_code)
        print(r.text)
        # 返回JSON而不是文本
        data = r.json()
        print("Return type : ", type(data))
        return data
    except Exception as e:
        print(traceback.format_exc())
        return {"error": str(e)}
