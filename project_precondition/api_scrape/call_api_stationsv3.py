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
        "stations_v3": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "stations_url": "https://api.jcdecaux.com/vls/v3/stations",
        "contract" : "dublin"
    }
"""

def call_api_stationsv3():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(api_config.API_CONFIG["single_station"]["single_station_url"], params={"apiKey": api_config.API_CONFIG["single_station"]["apiKey"], "contract": api_config.API_CONFIG["single_station"]["contract"]}, headers=headers)
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
        call_api_stationsv3()
        # time.sleep(5*60) # NOTE: if you are downloading static station data only, you need to do this just once!
    except:
        print(traceback.format_exc())

# CTRL + Z or CTRL + C to stop it
main()    