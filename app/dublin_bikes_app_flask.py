from flask import Flask, jsonify, render_template
import mysql.connector
# from dotenv import load_dotenv
import os
import requests
import dbinfo
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt

# load_dotenv()

#Connect to local db to access static station data.
# mydb = mysql.connector.connect(
#   host=os.getenv("host"),
#   user=os.getenv("user"),
#   password=os.getenv("password"),
#   database=os.getenv("database")
# )

# Connect to EC2 MySQL db to access static station data.
mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="zx9426498",
  database="se21_local",
)

mycursor = mydb.cursor()

app = Flask(__name__, static_url_path="")

# First route. Connect to the stations table, fetch the data and return as json.
@app.route('/stations', methods=['GET'])
def get_stations():
    mycursor = mydb.cursor(dictionary=True)
    mycursor.execute("SELECT * FROM station")
    rows = mycursor.fetchall()
    return jsonify(rows)

# Second route. Fetching dynamic info directly from JcDecaux. When user clicks on a marker a API request is completed to get the up 
# to date dynamic info.
@app.route('/dynamic/<int:station_Number>')
def dynamic_details (station_Number):  
    api_key = dbinfo.JCKEY
    contract = dbinfo.NAME
    r = requests.get(f"https://api.jcdecaux.com/vls/v3/stations/{station_Number}?contract={contract}&apiKey={api_key}")

    if r.status_code != 200:
            return jsonify({'error': 'Failed to retrieve data from API'}), r.status_code

        
    print("Response Text: ", r.text)  # This will show the raw response body as a string

    try:
        data = r.json()  # Try to parse JSON
    except ValueError as e:
        return jsonify({'error': 'Invalid JSON received from API'}), 500

    available_bikes = data.get('mainStands', {}).get('availabilities', {}).get('bikes')
    available_bike_stands = data.get('mainStands', {}).get('availabilities', {}).get('stands')
    mechanical_bikes = data.get('mainStands', {}).get('availabilities', {}).get('mechanicalBikes')
    electrical_bikes = data.get('mainStands', {}).get('availabilities', {}).get('electricalBikes')
    status = data.get('status')
    last_update = data.get('lastUpdate')

    # Converting unicode to date time. Imported the datetime module.
    last_update_datetime = datetime.strptime(last_update, '%Y-%m-%dT%H:%M:%SZ').strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({
        'available_bikes': available_bikes,
        'available_bike_stands': available_bike_stands,
        'mechanical_bikes': mechanical_bikes,
        'electrical_bikes': electrical_bikes,
        'status': status,
        'last_update': last_update_datetime,
    })

# This section handles reading the historical data from a csv. Converting the last_reported feature to datatime and extracting the day of the week to a new feature
# 'day_of_week'. 
df = pd.read_csv('final_merged_data_trimmed.csv')

df['last_reported'] = pd.to_datetime(df['last_reported'])
df['day_of_week'] = df['last_reported'].dt.day_name()
df['hour'] = df['last_reported'].dt.hour

def station_details_barchart(station_id):
    
    current_day = datetime.today().strftime('%A')
    station_data = df[(df['station_id'] == station_id) & (df['day_of_week'] == current_day)]

    avg_bikes_per_hour = station_data.groupby('hour')['num_bikes_available'].mean()
    avg_bike_stands_per_hour = station_data.groupby('hour')['num_docks_available'].mean()

    avg_bikes_per_hour = avg_bikes_per_hour[(avg_bikes_per_hour.index >= 5) & (avg_bikes_per_hour.index <= 23)]
    avg_bike_stands_per_hour = avg_bike_stands_per_hour[(avg_bike_stands_per_hour.index >= 5) & (avg_bike_stands_per_hour.index <= 23)]

    fig, ax = plt.subplots(2, 1, figsize=(12, 14))

    avg_bikes_per_hour.plot(kind='bar', stacked=True, colormap='viridis', ax=ax[0])
    ax[0].set_title("Average Available Bikes per Hour on " + current_day + "'s")
    ax[0].set_xlabel('Hour of the Day')
    ax[0].set_ylabel('Average Available Bikes')
    ax[0].set_xticklabels(avg_bikes_per_hour.index, rotation=45)

    avg_bike_stands_per_hour.plot(kind='bar', stacked=True, colormap='magma', ax=ax[1])
    ax[1].set_title("Average Bike Stands (Docks) per Hour on " + current_day + "'s")
    ax[1].set_xlabel('Hour of the Day')
    ax[1].set_ylabel('Average Bike Stands Available')
    ax[1].set_xticklabels(avg_bike_stands_per_hour.index, rotation=45)

    img_path = "static/images/station_" + str(station_id) + "_" + current_day + ".png"
    os.makedirs(os.path.dirname(img_path), exist_ok=True)

    ax[0].grid(True, axis='both', zorder=1)
    ax[1].grid(True, axis='both', zorder=1)

    plt.tight_layout()
    plt.savefig(img_path)
    plt.close(fig)
    
    return img_path

# Third app route to get the plot in image form. When the user clicks on a marker this function will be called with the appropriate station ID and return
# a png file that contains an image of both plots of available stations and available stands stacked vertically.
@app.route('/get_barchart/<int:station_id>', methods=['GET'])
def get_barchart(station_id):
    img_path = station_details_barchart(station_id)
    if img_path:
        # Return the image path to the client
        return jsonify({'img_path': img_path})
    else:
        return jsonify({'error': 'No data available for this station.'}), 404

@app.route('/')
def index():
    return render_template('index.html', api_key = "AIzaSyCRiKA7AmZItAl0gwzFRJpN8jjQuyPYv68")
    # return render_template('dublin_bikes_app.html', api_key = "AIzaSyCRiKA7AmZItAl0gwzFRJpN8jjQuyPYv68")

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port=5001)

