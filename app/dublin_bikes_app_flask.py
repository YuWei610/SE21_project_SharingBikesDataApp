from flask import Flask, jsonify, render_template
import mysql.connector
from dotenv import load_dotenv
import os
import requests
import dbinfo
from datetime import datetime

load_dotenv()

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
  password="",
  database="se21_local",
)

mycursor = mydb.cursor()

app = Flask(__name__, static_url_path="")

# First route. Connect to the stations table, fetch the data and return as json.
@app.route('/stations', methods=['GET'])
def get_stations():
    mycursor = mydb.cursor(dictionary=True)
    mycursor.execute("SELECT * FROM stations")
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

@app.route('/')
def index():
    return render_template('index.html', api_key = os.getenv("gmaps_api_key"))

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port=5000)

