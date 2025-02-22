import requests
import traceback
import datetime
import time
import os
import api_config
import json
import sqlalchemy as sqla
from sqlalchemy import create_engine, text  # 確保正確匯入 text
import glob
import os
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display


def stations_to_db(text_data, in_engine):
    # let us load the stations from the text received from jcdecaux
    stations = json.loads(text_data)

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
        vals = {
            "number": station.get("number"),
            "address": station.get('address'),
            "banking": int(station.get('banking')),
            "bikestands": int(station.get('bike_stands')),
            "name": station.get('name'),
            # "status": station.get('status')
        }
        
        # Prepare the SQL statement using text() and use bind parameters
        stmt = text("""
            INSERT INTO se21_local.station (number, address, banking, bike_stands, name) 
            VALUES (:number, :address, :banking, :bikestands, :name)
            ON DUPLICATE KEY UPDATE 
            address = VALUES(address), 
            banking = VALUES(banking), 
            bike_stands = VALUES(bike_stands), 
            name = VALUES(name);
        """)

        # Execute the statement with the dictionary values
        with in_engine.connect() as conn:
            conn.execute(stmt, vals)
            conn.commit()



def main():
    USER = "root"
    PASSWORD = "betty766"
    PORT = "3306"
    DB = "se21_local"
    URI = "127.0.0.1"

    connection_string = "mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB)

    engine = create_engine(connection_string, echo=True)

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(api_config.API_CONFIG["stations"]["stations_url"], params={"apiKey": api_config.API_CONFIG["stations"]["apiKey"], "contract": api_config.API_CONFIG["stations"]["contract"]}, headers=headers)
        print(r)
        print("----------------")
        print(r.text)
        data = r.json() 
        print(type(data))

        stations_to_db(r.text, engine)
        time.sleep(5*60)
    except:
        print(traceback.format_exc())

# CTRL + Z or CTRL + C to stop it
main()
