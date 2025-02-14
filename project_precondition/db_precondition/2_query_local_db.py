import pandas as pd
from sqlalchemy import create_engine, text

USER = "root"
PASSWORD = "YOUR_PASSWORD"
PORT = "3306"
DB = "se21_local"
URI = "127.0.0.1"

connection_string = "mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB)

engine = create_engine(connection_string, echo=True)

# 建built Connection and execute SQL sytax
with engine.connect() as connection:
    # QUERY 1: Counting the total number of rows in the station table
    sql_count = text("SELECT COUNT(*) FROM se21_local.station;")
    num_stations = connection.execute(sql_count).fetchall()
    print('The number of stations is {}'.format(num_stations[0][0]))