from flask import Flask, jsonify, render_template, request
import mysql.connector
from dotenv import load_dotenv
import os
import requests
import dbinfo
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
from call_api_function.call_api_single_stations import call_api_single_stations
from call_api_function.call_api_weather_by_latlon import call_api_weather

import joblib
# Load models once
bike_model = joblib.load("ML_function/bike_availability_model.pkl")
stand_model = joblib.load("ML_function/bike_stand_availability_model.pkl")

load_dotenv()

try:
    # Connect to EC2 MySQL db to access static station data.
    mydb = mysql.connector.connect(
        host=os.getenv("host"),
        user=os.getenv("user"),
        password=os.getenv("password"),
        database=os.getenv("database"),
        port=int(os.getenv("port"))
    )
    print("✅ Database connected!", flush=True)
except Exception as e:
    print("❌ Database connection failed:", e, flush=True)


mycursor = mydb.cursor()

app = Flask(__name__, static_url_path="")

# First route. Connect to the stations table, fetch the data and return as json.
@app.route('/get_stations', methods=['GET'])
def get_stations():
    mycursor = mydb.cursor(dictionary=True)
    mycursor.execute("SELECT * FROM station")
    rows = mycursor.fetchall()
    print("get_stations - DB result :", rows, flush=True)

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


# Get the bikes and bike_stands prediction
@app.route('/predict_availability', methods=['POST'])
def predict_availability():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON"}), 400
        
        station_id = int(data['station_id'])
        # 1. Get current date info
        now = datetime.now()
        current_hour = now.hour
        day_of_week = now.weekday() + 1  # Monday = 1

        selected_hour = int(data['hour'])
        # 移除时间检查逻辑，允许所有时间进行预测
        
        # 2. Get latitude and longitude
        station_info = call_api_single_stations(station_id)
        lat = station_info.get("position", {}).get("latitude")
        lon = station_info.get("position", {}).get("longitude")
        if lat is None or lon is None:
            return jsonify({"error": "Invalid station info"}), 400
        
        # 3. Get weather information
        weather_response = call_api_weather(lat, lon)
        index = selected_hour - current_hour

        hourly = weather_response.get("hourly", [])
        weather_hour = hourly[index]
        temperature_c = round(weather_hour.get("temp", 273.15) - 273.15, 2)
        wind_speed = weather_hour.get("wind_speed", 0.0)
        precipitation = 1 if weather_hour.get("weather", [{}])[0].get("main", "") == "Rain" else 0

        # 4. Format input
        input_df = pd.DataFrame([{
            "station_id": station_id,
            "temperature": temperature_c,
            "precipitation": precipitation,
            "wind_speed": wind_speed,
            "hour": selected_hour,
            "day_of_week": day_of_week
        }])

        # 5. Run prediction
        predicted_bikes = int(round(bike_model.predict(input_df)[0]))
        predicted_stands = int(round(stand_model.predict(input_df)[0]))

        return jsonify({
            "bikes": predicted_bikes,
            "bike_stands": predicted_stands
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 新增API端点：获取所有站点信息（用于填充下拉菜单）
@app.route('/get_all_stations', methods=['GET'])
def get_all_stations():
    try:
        mycursor = mydb.cursor(dictionary=True)
        mycursor.execute("SELECT number, name, address FROM station ORDER BY name")
        stations = mycursor.fetchall()
        return jsonify({"stations": stations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route('/get_weather_summary', methods=['GET'])
# def get_weather_summary():
#     try:
#         # 都柏林中心經緯度
#         lat, lon = 53.349805, -6.26031
        
#         # 調用你已經寫好的 call_api_weather 函式
#         weather_data = call_api_weather(lat, lon)
#         current_weather = weather_data.get("current", {})

#         # 改為攝氏溫度（API 給的是 Kelvin）
#         temp_celsius = round(current_weather.get("temp", 273.15) - 273.15, 2)
#         description = current_weather.get("weather", [{}])[0].get("description", "N/A").capitalize()

#         summary = f"Dublin: {temp_celsius}°C, {description}"

#         return jsonify({"summary": summary})
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# homepage weather information
@app.route('/get_weather_summary', methods=['GET'])
def get_weather_summary():
    try:
        # Coordinates for Dublin city center
        lat, lon = 53.349805, -6.26031
        
        # Call your existing weather API wrapper function
        weather_data = call_api_weather(lat, lon)
        current_weather = weather_data.get("current", {})

        # Convert temperature from Kelvin to Celsius
        temp_celsius = round(current_weather.get("temp", 273.15) - 273.15, 2)

        # Get weather description and capitalize it (e.g., "clear sky")
        description = current_weather.get("weather", [{}])[0].get("description", "N/A").capitalize()

        # Format summary string
        summary = f"Dublin: {temp_celsius}°C, {description}"

        # Return summary to frontend
        return jsonify({"summary": summary})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 新增API端点：根据站点和时间筛选数据
@app.route('/filter_data', methods=['POST'])
def filter_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON"}), 400
        
        station_id = data.get('station_id')
        hour = data.get('hour')
        
        # 准备查询条件
        query_conditions = []
        params = []
        
        # 1. 如果选择了特定站点
        if station_id and station_id != "":
            query_conditions.append("s.number = %s")
            params.append(int(station_id))
        
        # 2. 构建基本查询
        query = """
            SELECT s.number, s.name, s.address, 
                   a.available_bikes, a.available_bike_stands, s.bike_stands,
                   ROUND(a.available_bikes / s.bike_stands * 100) as bike_percentage,
                   ROUND(a.available_bike_stands / s.bike_stands * 100) as stand_percentage,
                   a.status, DATE_FORMAT(a.last_update, '%Y-%m-%d %H:%i:%s') as last_update
            FROM station s
            JOIN availability a ON s.number = a.number
        """
        
        # 3. 添加查询条件
        if query_conditions:
            query += " WHERE " + " AND ".join(query_conditions)
        
        # 4. 添加排序
        query += " ORDER BY s.name"
        
        # 5. 执行查询
        mycursor = mydb.cursor(dictionary=True)
        mycursor.execute(query, params)
        results = mycursor.fetchall()
        
        # 6. 如果指定了时间，使用ML模型进行预测
        if hour is not None and (not station_id or station_id == ""):
            # 为所有站点预测指定时间点的可用情况
            now = datetime.now()
            current_hour = now.hour
            day_of_week = now.weekday() + 1  # Monday = 1
            selected_hour = int(hour)
            
            # 只有当选择的时间在未来时才预测
            if selected_hour > current_hour:
                # 获取所有站点及其位置
                stations_query = "SELECT number, position_lat, position_lon FROM station"
                mycursor.execute(stations_query)
                stations = mycursor.fetchall()
                
                # 预测结果列表
                prediction_results = []
                
                # 获取天气数据（使用都柏林中心位置）
                weather_response = call_api_weather(53.349805, -6.260310)
                index = selected_hour - current_hour
                hourly = weather_response.get("hourly", [])
                
                if index < len(hourly):
                    weather_hour = hourly[index]
                    temperature_c = round(weather_hour.get("temp", 273.15) - 273.15, 2)
                    wind_speed = weather_hour.get("wind_speed", 0.0)
                    precipitation = 1 if weather_hour.get("weather", [{}])[0].get("main", "") == "Rain" else 0
                    
                    # 为每个站点进行预测
                    for station in stations:
                        input_df = pd.DataFrame([{
                            "station_id": station["number"],
                            "temperature": temperature_c,
                            "precipitation": precipitation,
                            "wind_speed": wind_speed,
                            "hour": selected_hour,
                            "day_of_week": day_of_week
                        }])
                        
                        predicted_bikes = int(round(bike_model.predict(input_df)[0]))
                        predicted_stands = int(round(stand_model.predict(input_df)[0]))
                        
                        # 找到对应站点的结果
                        for result in results:
                            if result["number"] == station["number"]:
                                result["predicted_bikes"] = predicted_bikes
                                result["predicted_stands"] = predicted_stands
                                result["prediction_time"] = f"{selected_hour}:00"
                                break
        
        # 7. 如果指定了站点和时间，只预测该站点
        elif hour is not None and station_id and station_id != "":
            now = datetime.now()
            current_hour = now.hour
            day_of_week = now.weekday() + 1
            selected_hour = int(hour)
            
            if selected_hour > current_hour:
                station_info = None
                for result in results:
                    if result["number"] == int(station_id):
                        station_info = result
                        break
                        
                if station_info:
                    # 获取站点位置
                    station_query = "SELECT position_lat, position_lon FROM station WHERE number = %s"
                    mycursor.execute(station_query, (int(station_id),))
                    station_location = mycursor.fetchone()
                    
                    if station_location:
                        # 获取天气数据
                        weather_response = call_api_weather(
                            station_location["position_lat"], 
                            station_location["position_lon"]
                        )
                        index = selected_hour - current_hour
                        hourly = weather_response.get("hourly", [])
                        
                        if index < len(hourly):
                            weather_hour = hourly[index]
                            temperature_c = round(weather_hour.get("temp", 273.15) - 273.15, 2)
                            wind_speed = weather_hour.get("wind_speed", 0.0)
                            precipitation = 1 if weather_hour.get("weather", [{}])[0].get("main", "") == "Rain" else 0
                            
                            input_df = pd.DataFrame([{
                                "station_id": int(station_id),
                                "temperature": temperature_c,
                                "precipitation": precipitation,
                                "wind_speed": wind_speed,
                                "hour": selected_hour,
                                "day_of_week": day_of_week
                            }])
                            
                            predicted_bikes = int(round(bike_model.predict(input_df)[0]))
                            predicted_stands = int(round(stand_model.predict(input_df)[0]))
                            
                            station_info["predicted_bikes"] = predicted_bikes
                            station_info["predicted_stands"] = predicted_stands
                            station_info["prediction_time"] = f"{selected_hour}:00"
        
        # 8. 处理结果数据
        for result in results:
            total_stands = result.get("bike_stands", 0)
            if total_stands > 0:
                result["usage_percentage"] = round((result.get("available_bikes", 0) / total_stands) * 100)
            else:
                result["usage_percentage"] = 0
        
        return jsonify({
            "results": results,
            "count": len(results),
            "selected_hour": hour,
            "selected_station": station_id
        })
        
    except Exception as e:
        print(f"Error in filter_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html', api_key = "AIzaSyCRiKA7AmZItAl0gwzFRJpN8jjQuyPYv68")
    # return render_template('dublin_bikes_app.html', api_key = "AIzaSyCRiKA7AmZItAl0gwzFRJpN8jjQuyPYv68")

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port=5000)

