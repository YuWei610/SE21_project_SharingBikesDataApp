import requests
import traceback
from datetime import datetime
import time
import sys
import os
import json
import sqlalchemy as sqla
from sqlalchemy import create_engine, text
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
from a_query_position_to_weather import query_position_to_weather
from b_call_api_weather_by_latlon import call_api_weather

"""
api_config.API_CONFIG:
    "weather": {
        "weather_url": "https://api.openweathermap.org/data/3.0/onecall",
        "params": {
            "lat": {},
            "lon": {},
            "appid": "70450CF782D602A647A20873C8FB5FD4"
        }
"""

def convert_unix_to_datetime(unix_time):
    return datetime.utcfromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')

def kelvin_to_celsius(k):
    return round(k - 273.15, 2)

def to_current(r_text, in_engine, number, address, lat, lon, name):
    current_data = json.loads(r_text)

    print("current_data: ", current_data)

    timezone = current_data["timezone"]
    timezone_offset = current_data["timezone_offset"]


    # let us extract the relevant info from the dictionary
    vals = {
        "number": number,
        "name": name,
        "address": address,
        "latitude": lat,
        "longitude": lon,
        "timezone": timezone,
        "timezone_offset": timezone_offset,
        "timestamp": convert_unix_to_datetime(current_data["current"]["dt"]),
        "sunrise": convert_unix_to_datetime(current_data["current"]["sunrise"]),
        "sunset": convert_unix_to_datetime(current_data["current"]["sunset"]),
        "temperature_C": kelvin_to_celsius(current_data["current"]["temp"]),
        "feels_like_C": kelvin_to_celsius(current_data["current"]["feels_like"]),
        "pressure_hPa": current_data["current"]["pressure"],
        "humidity_percent": current_data["current"]["humidity"],
        "dew_point_C": kelvin_to_celsius(current_data["current"]["dew_point"]),
        "uvi": current_data["current"]["uvi"],
        "cloud_coverage_percent": current_data["current"]["clouds"],
        "visibility_m": current_data["current"]["visibility"],
        "wind_speed_mps": current_data["current"]["wind_speed"],
        "wind_direction_deg": current_data["current"]["wind_deg"],
        "weather_id": current_data["current"]["weather"][0]["id"],
        "weather_main": current_data["current"]["weather"][0]["main"],
        "weather_description": current_data["current"]["weather"][0]["description"],
        "weather_icon": current_data["current"]["weather"][0]["icon"],
        "pop": current_data["current"].get("pop", None),
        "rain": json.dumps(current_data["current"].get("rain", None)),
        "snow": json.dumps(current_data["current"].get("snow", None))
    }

    # Prepare the SQL statement using text() and use bind parameters
    stmt = text("""
        INSERT INTO weather_current (
            number, name, address, latitude, longitude, timezone, timezone_offset, timestamp, 
            sunrise, sunset, temperature_C, feels_like_C, pressure_hPa, humidity_percent, 
            dew_point_C, uvi, cloud_coverage_percent, visibility_m, wind_speed_mps, 
            wind_direction_deg, weather_id, weather_main, weather_description, weather_icon, 
            pop, rain, snow
        ) 
        VALUES (
            :number, :name, :address, :latitude, :longitude, :timezone, :timezone_offset, :timestamp, 
            :sunrise, :sunset, :temperature_C, :feels_like_C, :pressure_hPa, :humidity_percent, 
            :dew_point_C, :uvi, :cloud_coverage_percent, :visibility_m, :wind_speed_mps, 
            :wind_direction_deg, :weather_id, :weather_main, :weather_description, :weather_icon, 
            :pop, :rain, :snow
        );
    """)
    # Execute the statement with the dictionary values
    with in_engine.connect() as conn:
        conn.execute(stmt, vals)
        conn.commit()
    return

def to_hourly(r_text, in_engine, number, address, lat, lon, name):
    data = json.loads(r_text)

    timezone = data["timezone"]
    timezone_offset = data["timezone_offset"]
    hourly_data = data["hourly"]

    for i in hourly_data:

        # let us extract the relevant info from the dictionary
        vals = {
            "number": int(number),
            "name": name,
            "address": address,
            "latitude": float(lat),
            "longitude": float(lon),
            "timezone": timezone,
            "timezone_offset": int(timezone_offset) if timezone_offset is not None else None,
            "timestamp": convert_unix_to_datetime(i["dt"]),
            "temperature_C": kelvin_to_celsius(i["temp"]),
            "feels_like_C": kelvin_to_celsius(i["feels_like"]),
            "pressure_hPa": int(i["pressure"]),
            "humidity_percent": int(i["humidity"]),
            "dew_point_C": kelvin_to_celsius(i["dew_point"]),
            "uvi": float(i["uvi"]) if "uvi" in i else None,
            "cloud_coverage_percent": int(i["clouds"]),
            "visibility_m": float(i["visibility"]) if "visibility" in i else None,
            "wind_speed_mps": float(i["wind_speed"]),
            "wind_direction_deg": int(i["wind_deg"]),
            "wind_gust": float(i.get("wind_gust", None)),
            "weather_id": int(i["weather"][0]["id"]),
            "weather_main": i["weather"][0]["main"],
            "weather_description": i["weather"][0]["description"],
            "weather_icon": i["weather"][0]["icon"],
            "pop": float(i.get("pop", None)) if "pop" in i else None,
            "rain": json.dumps(i.get("rain", None)) if isinstance(i.get("rain"), dict) else None,
            "snow": json.dumps(i.get("snow", None)) if isinstance(i.get("snow"), dict) else None
        }

        # Prepare the SQL statement using text() and use bind parameters
        stmt = text("""
            INSERT INTO weather_hourly (
                number, name, address, latitude, longitude, timezone, timezone_offset, timestamp, 
                temperature_C, feels_like_C, pressure_hPa, humidity_percent, 
                dew_point_C, uvi, cloud_coverage_percent, visibility_m, wind_speed_mps, 
                wind_direction_deg, wind_gust, weather_id, weather_main, weather_description, 
                weather_icon, pop, rain, snow
            ) 
            VALUES (
                :number, :name, :address, :latitude, :longitude, :timezone, :timezone_offset, :timestamp, 
                :temperature_C, :feels_like_C, :pressure_hPa, :humidity_percent, 
                :dew_point_C, :uvi, :cloud_coverage_percent, :visibility_m, :wind_speed_mps, 
                :wind_direction_deg, :wind_gust, :weather_id, :weather_main, :weather_description, 
                :weather_icon, :pop, :rain, :snow
            );
        """)
        # Execute the statement with the dictionary values
        with in_engine.connect() as conn:
            conn.execute(stmt, vals)
            conn.commit()
        
    return



def to_daily(r_text, in_engine, number, address, lat, lon, name):
    data = json.loads(r_text)

    timezone = data["timezone"]
    timezone_offset = data["timezone_offset"]
    daily_data = data["daily"]

    for i in daily_data:
        # let us extract the relevant info from the dictionary
        vals = {
            "number": int(number),
            "name": name,
            "address": address,
            "latitude": float(lat),
            "longitude": float(lon),
            "timezone": timezone,
            "timezone_offset": int(timezone_offset) if timezone_offset is not None else None,
            "date": convert_unix_to_datetime(i["dt"]),
            "sunrise": convert_unix_to_datetime(i["sunrise"]),
            "sunset": convert_unix_to_datetime(i["sunset"]),
            "moonrise": convert_unix_to_datetime(i["moonrise"]),
            "moonset": convert_unix_to_datetime(i["moonset"]),
            "moon_phase": float(i["moon_phase"]),
            "summary": i.get("summary", None),
            "temp_day": kelvin_to_celsius(i["temp"]["day"]),
            "temp_min": kelvin_to_celsius(i["temp"]["min"]),
            "temp_max": kelvin_to_celsius(i["temp"]["max"]),
            "temp_night": kelvin_to_celsius(i["temp"]["night"]),
            "temp_eve": kelvin_to_celsius(i["temp"]["eve"]),
            "temp_morn": kelvin_to_celsius(i["temp"]["morn"]),
            "feels_like_day": kelvin_to_celsius(i["feels_like"]["day"]),
            "feels_like_night": kelvin_to_celsius(i["feels_like"]["night"]),
            "feels_like_eve": kelvin_to_celsius(i["feels_like"]["eve"]),
            "feels_like_morn": kelvin_to_celsius(i["feels_like"]["morn"]),
            "pressure_hPa": int(i["pressure"]),
            "humidity_percent": int(i["humidity"]),
            "dew_point_C": kelvin_to_celsius(i["dew_point"]),
            "wind_speed_mps": float(i["wind_speed"]),
            "wind_deg": int(i["wind_deg"]),
            "wind_gust_mps": float(i.get("wind_gust", None)),
            "cloud_coverage_percent": int(i["clouds"]),
            "pop": float(i.get("pop", None)) if "pop" in i else None,
            "uvi": float(i["uvi"]) if "uvi" in i else None,
            "weather_id": int(i["weather"][0]["id"]),
            "weather_main": i["weather"][0]["main"],
            "weather_description": i["weather"][0]["description"],
            "weather_icon": i["weather"][0]["icon"],
            "rain": json.dumps(i.get("rain", None)) if isinstance(i.get("rain"), dict) else None,
            "snow": json.dumps(i.get("snow", None)) if isinstance(i.get("snow"), dict) else None
        }

        stmt = text("""
            INSERT INTO weather_daily (
                date, number, name, address, latitude, longitude, timezone, timezone_offset,
                sunrise, sunset, moonrise, moonset, moon_phase, summary, 
                temp_day, temp_min, temp_max, temp_night, temp_eve, temp_morn,
                feels_like_day, feels_like_night, feels_like_eve, feels_like_morn,
                pressure_hPa, humidity_percent, dew_point_C, wind_speed_mps, wind_deg, wind_gust_mps, 
                cloud_coverage_percent, pop, uvi, weather_id, weather_main, weather_description, 
                weather_icon, rain, snow
            ) 
            VALUES (
                :date, :number, :name, :address, :latitude, :longitude, :timezone, :timezone_offset,
                :sunrise, :sunset, :moonrise, :moonset, :moon_phase, :summary,
                :temp_day, :temp_min, :temp_max, :temp_night, :temp_eve, :temp_morn,
                :feels_like_day, :feels_like_night, :feels_like_eve, :feels_like_morn,
                :pressure_hPa, :humidity_percent, :dew_point_C, :wind_speed_mps, :wind_deg, :wind_gust_mps,
                :cloud_coverage_percent, :pop, :uvi, :weather_id, :weather_main, :weather_description, 
                :weather_icon, :rain, :snow
            );
        """)

        # Execute the statement with the dictionary values
        with in_engine.connect() as conn:
            conn.execute(stmt, vals)
            conn.commit()

    return



def main():
    while True :
        try:
            data_in_list = query_position_to_weather()
            # print(data_in_list)
            for i in data_in_list:
                number = i["number"]
                address = i["address"]
                # banking = i["banking"]
                # bike_stands = i["bike_stands"]
                name = i["name"]
                lat = i["position_lat"]
                lon = i["position_lon"]
                r_text = call_api_weather(lat,lon)

                to_current(r_text, engine, number, address, lat, lon, name)
                to_hourly(r_text, engine, number, address, lat, lon, name)
                to_daily(r_text, engine, number, address, lat, lon, name)
        except:
            print(traceback.format_exc())
        
        time.sleep(60*60)


# CTRL + Z or CTRL + C to stop it
main()
