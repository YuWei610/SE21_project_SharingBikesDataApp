####################DOWNLOAD from JCDECAUX###############
import requests
import traceback
import datetime
import time
import sys
import os
import pandas as pd

# get api_config path
project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# add it into sys.path
sys.path.append(project_path)

# import api_config
import api_config


def main():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        r = requests.get(api_config.API_CONFIG["weather"]["weather_url"], params={"apiKey": api_config.API_CONFIG["weather"]["params"]["appid"], "lat": api_config.API_CONFIG["weather"]["params"]["lat"], "lon": api_config.API_CONFIG["weather"]["params"]["lon"]}, headers=headers)
        print(r)
        data = r.json() 
        print(type(data))
        print(len(data))
        print(data)
        

        # # 轉換成 DataFrame
        # df = pd.DataFrame(data)

        # df["lat"] = df["position"].apply(lambda x: x["lat"])
        # df["lng"] = df["position"].apply(lambda x: x["lng"])

        # # 移除原始的 position 欄位
        # df = df.drop(columns=["position"])

        # # I first need to create a folder data where the files will be stored.
        # if not os.path.exists('data'):
        #     os.mkdir('data')
        #     print("Folder 'data' created!")
        # else:
        #     print("Folder 'data' already exists.")

        # # now is a variable from datetime, which will go in {}.
        # # replace is replacing white spaces with underscores in the file names
        # now = datetime.datetime.now()
        # df.to_csv("data/bikes_{}.csv".format(now).replace(" ", "_"))

        # # 查看欄位
        # print(df.columns)

        # # 看前 5 筆資料
        # print(df.head(1))


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