import requests
import traceback
import datetime
import time
import sys
import os
import json
import sqlalchemy as sqla
from sqlalchemy import create_engine, text  # 確保正確匯入 text
import glob
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display

# get api_config, db_config, call_apis_function path
project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api_scrape"))

# add it into sys.path
sys.path.append(project_path)

# import api_config, db_config, call_apis_function 
import api_config
import db_config
from db_config import engine
from call_api_stations import call_api_stations

"""
api_config.API_CONFIG:
    "stations": {
        "apiKey": "29eb88187a0abad2baa09b51a856699b8f4bc972",
        "stations_url": "https://api.jcdecaux.com/vls/v1/stations",
        "contract" : "dublin"
    },
"""


def stations_to_stations(text_data, in_engine):
    # let us load the stations from the text received from jcdecaux
    stations = json.loads(text_data)

    for station in stations:        
        # let us extract the relevant info from the dictionary
        vals = {
            "number": int(station.get("number")),
            "address": str(station.get('address')),
            "banking": int(station.get('banking')),
            "bike_stands": int(station.get('bike_stands')),
            "name": str(station.get('name')),
            "position_lat": float(station.get('position').get('lat')),
            "position_lon": float(station.get('position').get('lon'))
            # "status": station.get('status')
        }
        
        # Prepare the SQL statement using text() and use bind parameters

        stmt = text("""
            INSERT INTO se21_local.station 
            (number, address, banking, bike_stands, name, position_lat, position_lon)
            VALUES 
            (:number, :address, :banking, :bike_stands, :name, :position_lat, :position_lon)
            ON DUPLICATE KEY UPDATE 
            address = VALUES(address),
            banking = VALUES(banking),
            bike_stands = VALUES(bike_stands),
            name = VALUES(name),
            position_lat = VALUES(position_lat),
            position_lon = VALUES(position_lon);
        """)

        # Execute the statement with the dictionary values
        with in_engine.connect() as conn:
            conn.execute(stmt, vals)
            conn.commit()



def main():
    try:
        r_text = call_api_stations()
        stations_to_stations(r_text, engine)
        # time.sleep(5*60)
    except:
        print(traceback.format_exc())

# CTRL + Z or CTRL + C to stop it
main()
