####################DOWNLOAD from JCDECAUX###############
import requests
import traceback
import datetime
import time
import sys
import os
import pandas as pd

# get api_config path
project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# add it into sys.path
sys.path.append(project_path)

# import api_config
import api_config

"""
api_config.API_CONFIG:
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": 33.44,
            "lon": -94.04,
            "appid": "70450CF782D602A647A20873C8FB5FD4"
        }
"""

def call_api_weather():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(api_config.API_CONFIG["weather"]["weather_url"], params={"apiKey": api_config.API_CONFIG["weather"]["params"]["appid"], "lat": api_config.API_CONFIG["weather"]["params"]["lat"], "lon": api_config.API_CONFIG["weather"]["params"]["lon"]}, headers=headers)
        print(r.status_code)
        print(r.text)
        # data = r.json() 
        print("Return type : ", type(r.text))
        print("Return content : ", r.text)
        return r.text
    except:
        print(traceback.format_exc())


def main():
    try:
        call_api_weather()
        # time.sleep(5*60) # NOTE: if you are downloading static station data only, you need to do this just once!
    except:
        print(traceback.format_exc())

# CTRL + Z or CTRL + C to stop it
main()    