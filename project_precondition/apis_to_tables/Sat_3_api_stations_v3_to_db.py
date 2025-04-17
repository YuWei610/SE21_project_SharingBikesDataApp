import requests
import traceback
from datetime import datetime as dt
import time
import os
import json
import sqlalchemy as sqla
from sqlalchemy import create_engine, text 
import glob
import sys
import os
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
from db_config import engine


def stationsv3_to_db(text_data, in_engine):
    """Insert or update multiple stationsv3 data into the database."""
    stationsv3 = json.loads(text_data)
    
    print(type(stationsv3), len(stationsv3))


    
    for stationsv3 in stationsv3:
        last_update_raw = stationsv3.get("lastUpdate", "")
        try:
            last_update = dt.strptime(last_update_raw, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            last_update = "0000-00-00 00:00:00"  # Fallback value

        try :
            vals = {
                "number": int(stationsv3.get("number", 0)),
                "contract_name": str(stationsv3.get("contractName", "")),
                "name": str(stationsv3.get("name", "")),
                "address": str(stationsv3.get("address", "")),
                "latitude": float(stationsv3.get("position", {}).get("latitude", 0.0)),
                "longitude": float(stationsv3.get("position", {}).get("longitude", 0.0)),
                "banking": int(bool(stationsv3.get("banking", False))),
                "bonus": int(bool(stationsv3.get("bonus", False))),
                "status": str(stationsv3.get("status", "")),
                "last_update": last_update,
                "connected": int(bool(stationsv3.get("connected", False))),
                "overflow": int(bool(stationsv3.get("overflow", False))),
                "shape": stationsv3.get("shape") if stationsv3.get("shape") is not None else "{}",  # JSON format fallback
                "total_available_bikes": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("bikes", 0)),
                "total_available_stands": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("stands", 0)),
                "total_mechanical_bikes": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("mechanicalBikes", 0)),
                "total_electrical_bikes": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("electricalBikes", 0)),
                "total_electrical_internal_battery_bikes": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("electricalInternalBatteryBikes", 0)),
                "total_electrical_removable_battery_bikes": int(stationsv3.get("totalStands", {}).get("availabilities", {}).get("electricalRemovableBatteryBikes", 0)),
                "total_capacity": int(stationsv3.get("totalStands", {}).get("capacity", 0)),
                "main_available_bikes": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("bikes", 0)),
                "main_available_stands": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("stands", 0)),
                "main_mechanical_bikes": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("mechanicalBikes", 0)),
                "main_electrical_bikes": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("electricalBikes", 0)),
                "main_electrical_internal_battery_bikes": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("electricalInternalBatteryBikes", 0)),
                "main_electrical_removable_battery_bikes": int(stationsv3.get("mainStands", {}).get("availabilities", {}).get("electricalRemovableBatteryBikes", 0)),
                "main_capacity": int(stationsv3.get("mainStands", {}).get("capacity", 0))
            }
            
            stmt = text("""
                INSERT INTO se21_local.stationsv3 (number, contract_name, name, address, latitude, longitude, banking, bonus, status, last_update, connected, overflow, shape,
                    total_available_bikes, total_available_stands, total_mechanical_bikes, total_electrical_bikes, total_electrical_internal_battery_bikes, total_electrical_removable_battery_bikes, total_capacity,
                    main_available_bikes, main_available_stands, main_mechanical_bikes, main_electrical_bikes, main_electrical_internal_battery_bikes, main_electrical_removable_battery_bikes, main_capacity) 
                VALUES (:number, :contract_name, :name, :address, :latitude, :longitude, :banking, :bonus, :status, :last_update, :connected, :overflow, :shape,
                    :total_available_bikes, :total_available_stands, :total_mechanical_bikes, :total_electrical_bikes, :total_electrical_internal_battery_bikes, :total_electrical_removable_battery_bikes, :total_capacity,
                    :main_available_bikes, :main_available_stands, :main_mechanical_bikes, :main_electrical_bikes, :main_electrical_internal_battery_bikes, :main_electrical_removable_battery_bikes, :main_capacity);
            """)

            # Execute the statement with the dictionary values
            with in_engine.connect() as conn:
                conn.execute(stmt, vals)
                conn.commit()
        except:
            print(traceback.format_exc())



def main():
    USER = "root"
    PASSWORD = "YOUR_PASSWORD"
    PORT = "3306"
    DB = "se21_local"
    URI = "127.0.0.1"

    connection_string = "mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB)

    engine = create_engine(connection_string, echo=True)

    while True :
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            r = requests.get(api_config.API_CONFIG["stations_v3"]["stations_url"], params={"apiKey": api_config.API_CONFIG["stations_v3"]["apiKey"], "contract": api_config.API_CONFIG["stations_v3"]["contract"]}, headers=headers)
            # print(r)
            print("----------------")
            print(r.text)
            print(r.status_code)
            # data = r.json() 
            # print(type(data))
            stationsv3_to_db(r.text, engine)
            
        except:
            print(traceback.format_exc())
    
        time.sleep(5*60)

# CTRL + Z or CTRL + C to stop it
main()
