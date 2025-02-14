####################DOWNLOAD from JCDECAUX###############
import requests
import traceback
import datetime
import time
import sys
import os
import pandas as pd

# get dbinfo path
project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# add it into sys.path
sys.path.append(project_path)

# import dbinfo
import dbinfo



"""
Data are in dbinfo.py
CKEY = "...."
NAME = "dublin"
STATIONS_URI = "https://api.jcdecaux.com/vls/v1/stations"
"""

def main():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        # r = requests.get(dbinfo.STATIONS_URI, params={"apiKey": dbinfo.Rose, "contract": dbinfo.NAME})
        r = requests.get(dbinfo.STATIONS_URI, params={"apiKey": dbinfo.API_KEY, "contract": dbinfo.NAME}, headers=headers)
        print(r)
        data = r.json() 
        print(type(data))
        print(len(data))
        # print(data)
        

        # change data format to DataFrame
        df = pd.DataFrame(data)

        df["lat"] = df["position"].apply(lambda x: x["lat"])
        df["lng"] = df["position"].apply(lambda x: x["lng"])

        # remove the original position column
        df = df.drop(columns=["position"])

        # I first need to create a folder data where the files will be stored.
        if not os.path.exists('data'):
            os.mkdir('data')
            print("Folder 'data' created!")
        else:
            print("Folder 'data' already exists.")

        # now is a variable from datetime, which will go in {}.
        # replace is replacing white spaces with underscores in the file names
        now = datetime.datetime.now()
        df.to_csv("data/bikes_{}.csv".format(now).replace(" ", "_"))

        # check columns
        print(df.columns)

        # check fist row of data
        print(df.head(1))


    except:
        print(traceback.format_exc())


# def main():
#     while True:
#         try:
#             headers = {
#                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
#             }
#             # r = requests.get(dbinfo.STATIONS_URI, params={"apiKey": dbinfo.Rose, "contract": dbinfo.NAME})
#             r = requests.get(dbinfo.STATIONS_URI, params={"apiKey": dbinfo.Rose, "contract": dbinfo.NAME}, headers=headers)
#             print(r)
#             print(type(r.text))
#             # write_to_file(r.text)
#             time.sleep(5*60)
#         except:
#             print(traceback.format_exc())

# CTRL + Z to stop it
main()    