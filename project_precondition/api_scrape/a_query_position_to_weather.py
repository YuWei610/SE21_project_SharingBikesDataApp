import pandas as pd
from sqlalchemy import create_engine, text
import traceback

import db_config
from db_config import engine

def query_position_to_weather():
    try:
        # 建built Connection and execute SQL sytax
        with engine.connect() as connection:
            # QUERY 1: Counting the total number of rows in the station table
            sql_count = text("SELECT * FROM se21_local.station;")
            stations_info = connection.execute(sql_count)
            rows = stations_info.fetchall()
            columns = stations_info.keys()
            data_in_list = [dict(zip(columns, rows)) for rows in rows]

            print(type(data_in_list))
            print(data_in_list)
            return data_in_list
    except:
        print(traceback.format_exc())


query_position_to_weather()