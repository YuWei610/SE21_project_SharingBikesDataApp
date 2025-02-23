from sqlalchemy import create_engine

USER = "root"
PASSWORD = "betty766"
PORT = "3306"
DB = "se21_local"
URI = "127.0.0.1"

connection_string = "mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB)

engine = create_engine(connection_string, echo=True)