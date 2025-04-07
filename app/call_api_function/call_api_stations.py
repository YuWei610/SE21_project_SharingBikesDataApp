####################DOWNLOAD from JCDECAUX###############
import requests
import traceback
import datetime
import time
import sys
import os
import pandas as pd

# import api_config
import api_config

"""
api_config.API_CONFIG:
    "stations": {
        "apiKey": WEATHER_API_KEY ,
        "stations_url": "https://api.jcdecaux.com/vls/v1/stations",
        "contract" : CONTRACT
    },
"""

def call_api_stations():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(api_config.API_CONFIG["stations"]["stations_url"], params={"apiKey": api_config.API_CONFIG["stations"]["apiKey"], "contract": api_config.API_CONFIG["stations"]["contract"]}, headers=headers)
        print(r.status_code)
        print(r.text)
        # data = r.json() 
        print("Return type : ", type(r.text))
        print("Return content : ", r.text)
        return r.text
    except:
        print(traceback.format_exc())
        return traceback.format_exc()