import pandas as pd
from sqlalchemy import create_engine, text

USER = "root"
PASSWORD = "YOUR_PASSWORD"
PORT = "3306"
DB = "se21_local"
URI = "127.0.0.1"

# built SQLAlchemy connection
connection_string = f"mysql+pymysql://{USER}:{PASSWORD}@{URI}:{PORT}/{DB}"
engine = create_engine(connection_string, echo=True)


def table_exists(engine, table_name):
    """check table is exist"""
    check_sql = text(f"SHOW TABLES LIKE '{table_name}';")
    with engine.connect() as connection:
        result = connection.execute(check_sql).fetchall()
        return len(result) > 0  # if not 0, means tables that already exist

def print_table_structure(engine, table_name):
    """print column name and data type"""
    describe_sql = text(f"DESCRIBE {table_name};")
    with engine.connect() as connection:
        result = connection.execute(describe_sql).fetchall()
    
    print(f"\n📌 **{table_name} table struce:**")
    for row in result:
        print(f" - {row[0]} ({row[1]})")  # row[0] is column name, row[1] is data type

def create_station_table(engine):
    """create station table"""
    if table_exists(engine, "station"):
        print("⚠️ station table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE station (
            address VARCHAR(256), 
            banking INTEGER,
            bikestands INTEGER,
            name VARCHAR(256),
            status VARCHAR(256)
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ station created")
    
    print_table_structure(engine, "station")

def create_availability_table(engine):
    """create availability table"""
    if table_exists(engine, "availability"):
        print("⚠️ availability table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE availability (
            number INTEGER NOT NULL,
            last_update DATETIME NOT NULL,
            available_bikes INTEGER,
            available_bike_stands INTEGER,
            status VARCHAR(128),
            PRIMARY KEY (number, last_update)
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ availability created")
    
    print_table_structure(engine, "availability")

def create_current_table(engine):
    """create current table"""
    if table_exists(engine, "current"):
        print("⚠️ current table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE current (
            dt DATETIME NOT NULL,
            feels_like FLOAT,
            humidity INTEGER,
            pressure INTEGER,
            sunrise DATETIME,
            sunset DATETIME,
            temp FLOAT,
            uvi FLOAT,
            weather_id INTEGER,
            wind_gust FLOAT,
            wind_speed FLOAT,
            rain_1h FLOAT,
            snow_1h FLOAT,
            PRIMARY KEY (dt)
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ current created")
    
    print_table_structure(engine, "current")

def create_hourly_table(engine):
    """創建 hourly 表格"""
    if table_exists(engine, "hourly"):
        print("⚠️ hourly table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE hourly (
            dt DATETIME NOT NULL,
            future_dt DATETIME NOT NULL,
            feels_like FLOAT,
            humidity INTEGER,
            pop FLOAT,
            pressure INTEGER,
            temp FLOAT,
            uvi FLOAT,
            weather_id INTEGER,
            wind_speed FLOAT,
            wind_gust FLOAT,
            rain_1h FLOAT,
            snow_1h FLOAT,
            PRIMARY KEY (dt, future_dt)
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ hourly created")
    
    print_table_structure(engine, "hourly")

def create_daily_table(engine):
    """創建 daily 表格"""
    if table_exists(engine, "daily"):
        print("⚠️ daily table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE daily (
            dt DATETIME NOT NULL,
            future_dt DATETIME NOT NULL,
            humidity INTEGER,
            pop FLOAT,
            pressure INTEGER,
            temp_max FLOAT,
            temp_min FLOAT,
            uvi FLOAT,
            weather_id INTEGER,
            wind_speed FLOAT,
            wind_gust FLOAT,
            rain FLOAT,
            snow FLOAT,
            PRIMARY KEY (dt, future_dt)
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ daily created")
    
    print_table_structure(engine, "daily")

def main():

    # which table need to be created
    tables_to_create = ["station", "availability", "current", "hourly", "daily"]

    """create tables according to tables_to_create"""
    if "station" in tables_to_create:
        create_station_table(engine)

    if "availability" in tables_to_create:
        create_availability_table(engine)

    if "current" in tables_to_create:
        create_current_table(engine)

    if "hourly" in tables_to_create:
        create_hourly_table(engine)

    if "daily" in tables_to_create:
        create_daily_table(engine)

if __name__ == "__main__":
    main()
