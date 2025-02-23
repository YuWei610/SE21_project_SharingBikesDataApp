import pandas as pd
from sqlalchemy import create_engine, text

USER = "root"
PASSWORD = "betty766"
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

def create_stationsv3_table(engine):
    """Create the stationv3 table if it does not already exist."""
    if table_exists(engine, "stationsv3"):
        print("⚠️ stationsv3 table already exists, skipping table creation.")
    else:
        sql = text('''
        CREATE TABLE stationsv3 (
            number INTEGER PRIMARY KEY,
            contract_name VARCHAR(256),
            name VARCHAR(256),
            address VARCHAR(256),
            latitude FLOAT,
            longitude FLOAT,
            banking BOOLEAN,
            bonus BOOLEAN,
            status VARCHAR(50),
            last_update TIMESTAMP,
            connected BOOLEAN,
            overflow BOOLEAN,
            shape JSON,
            total_available_bikes INTEGER,
            total_available_stands INTEGER,
            total_mechanical_bikes INTEGER,
            total_electrical_bikes INTEGER,
            total_electrical_internal_battery_bikes INTEGER,
            total_electrical_removable_battery_bikes INTEGER,
            total_capacity INTEGER, -- Corresponds to totalStands["capacity"]
            main_available_bikes INTEGER,
            main_available_stands INTEGER,
            main_mechanical_bikes INTEGER,
            main_electrical_bikes INTEGER,
            main_electrical_internal_battery_bikes INTEGER,
            main_electrical_removable_battery_bikes INTEGER,
            main_capacity INTEGER -- Corresponds to mainStands["capacity"]
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ stationsv3 table created")
    
    print_table_structure(engine, "stationsv3")

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
    """create weather_current table"""
    if table_exists(engine, "weather_current"):
        print("⚠️ weather_current table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE weather_current (
            id INT AUTO_INCREMENT PRIMARY KEY,
            timestamp DATETIME NOT NULL,
            number INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            timezone VARCHAR(50),
            timezone_offset INT,
            sunrise DATETIME,
            sunset DATETIME,
            temperature_C FLOAT,
            feels_like_C FLOAT,
            pressure_hPa INT,
            humidity_percent INT,
            dew_point_C FLOAT,
            uvi FLOAT,
            cloud_coverage_percent INT,
            visibility_m FLOAT,
            wind_speed_mps FLOAT,
            wind_direction_deg INT,
            weather_id INT,
            weather_main VARCHAR(50),
            weather_description VARCHAR(100),
            weather_icon VARCHAR(10),
            pop FLOAT, 
            rain JSON, 
            snow JSON 
            );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ weather_current created")
    
    print_table_structure(engine, "weather_current")

def create_hourly_table(engine):
    """create weather_hourly table"""
    if table_exists(engine, "weather_hourly"):
        print("⚠️ weather_hourly table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE weather_hourly (
            id INT AUTO_INCREMENT PRIMARY KEY,
            timestamp DATETIME NOT NULL,   
            number INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            timezone VARCHAR(50),
            timezone_offset INT,
            temperature_C FLOAT,
            feels_like_C FLOAT,
            pressure_hPa INT,
            humidity_percent INT,
            dew_point_C FLOAT,
            uvi FLOAT,
            cloud_coverage_percent INT,
            visibility_m FLOAT,
            wind_speed_mps FLOAT,
            wind_direction_deg INT,
            wind_gust FLOAT,
            weather_id INT,
            weather_main VARCHAR(50),
            weather_description VARCHAR(100),
            weather_icon VARCHAR(10),
            pop FLOAT, 
            rain JSON, 
            snow JSON 
            );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ weather_hourly created")
    
    print_table_structure(engine, "weather_hourly")

def create_daily_table(engine):
    """create weather_daily table"""
    if table_exists(engine, "weather_daily"):
        print("⚠️ weather_daily table that already exist, skip the table creation.")
    else:
        sql = text('''
        CREATE TABLE weather_daily (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            date DATETIME NOT NULL,
            number INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            timezone VARCHAR(50),
            timezone_offset INT,
            sunrise DATETIME,
            sunset DATETIME,
            moonrise DATETIME,
            moonset DATETIME,
            moon_phase FLOAT,
            summary TEXT,
            temp_day FLOAT,
            temp_min FLOAT,
            temp_max FLOAT,
            temp_night FLOAT,
            temp_eve FLOAT,
            temp_morn FLOAT,
            feels_like_day FLOAT,
            feels_like_night FLOAT,
            feels_like_eve FLOAT,
            feels_like_morn FLOAT,
            pressure_hPa INT,
            humidity_percent INT,
            dew_point_C FLOAT,
            wind_speed_mps FLOAT,
            wind_deg INT,
            wind_gust_mps FLOAT,
            cloud_coverage_percent INT,
            pop FLOAT,
            uvi FLOAT,
            weather_id INT,
            weather_main VARCHAR(50),
            weather_description VARCHAR(100),
            weather_icon VARCHAR(10),
            rain JSON,
            snow JSON 
        );
        ''')
        with engine.connect() as connection:
            connection.execute(sql)
            connection.commit()
        print("✅ weather_daily created")
    
    print_table_structure(engine, "weather_daily")

def main():

    # which table need to be created
    # tables_to_create = ["stationsv3", "station", "availability", "current", "hourly", "daily"]
    tables_to_create = ["weather_current","weather_hourly","weather_daily"]


    """create tables according to tables_to_create"""
    if "stationsv3" in tables_to_create:
        create_stationsv3_table(engine)

    if "station" in tables_to_create:
        create_station_table(engine)

    if "availability" in tables_to_create:
        create_availability_table(engine)

    if "weather_current" in tables_to_create:
        create_current_table(engine)

    if "weather_hourly" in tables_to_create:
        create_hourly_table(engine)

    if "weather_daily" in tables_to_create:
        create_daily_table(engine)

if __name__ == "__main__":
    main()
