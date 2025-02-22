import requests
import traceback
import datetime
import time
import os
import project_precondition.api_scrape.api_config as api_config
import json
from sqlalchemy import create_engine 

def stations_to_db(text):
    # let us load the stations from the text received from jcdecaux
    stations = json.loads(text)

    # print type of the stations object, and number of stations
    print(type(stations), len(stations))
    
    # let us print the type of the object stations (a dictionary) and load the content
    for station in stations:
        print(type(station))

        # let us load only the parts that we have included in our db:
        # address VARCHAR(256), 
        # banking INTEGER,
        # bikestands INTEGER,
        # name VARCHAR(256),
        # status VARCHAR(256))
        
        # let us extract the relevant info from the dictionary
        vals = (station.get('address'), int(station.get('banking')), int(station.get('bike_stands')), 
                station.get('name'), station.get('status'))
        print(vals)


def main():
    try:
        r = requests.get(api_config.STATIONS_URI, params={"apiKey": api_config.API_KEY, "contract": api_config.NAME})
        stations_to_db(r.text)
        time.sleep(5*60) # NOTE: if you are downloading static station data only, you need to do this just once!
    except:
        print(traceback.format_exc())

# CTRL + Z or CTRL + C to stop it
main()   