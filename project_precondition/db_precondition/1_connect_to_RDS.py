from sqlalchemy import create_engine, text
import pymysql

# Database credentials
USER = "TBD_NEED_SHARED_METHOD"
PASSWORD = "TBD_NEED_SHARED_METHOD"
PORT = "3306"
DB = "dbbikes"
URI = "database-download-jc-decaux.c30wwi2iabza.eu-west-1.rds.amazonaws.com"

# Create connection string
connection_string = f"mysql+pymysql://{USER}:{PASSWORD}@{URI}:{PORT}"

# Create engine
engine = create_engine(connection_string, echo=True)

# Establish connection
with engine.connect() as conn:
    # Create database if it doesn't exist
    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB};"))
    
    # Switch to the created database
    conn.execute(text(f"USE {DB};"))
    
    # Execute "SHOW VARIABLES" command
    result = conn.execute(text("SHOW VARIABLES;"))
    
    # Print results
    for row in result:
        print(row)
