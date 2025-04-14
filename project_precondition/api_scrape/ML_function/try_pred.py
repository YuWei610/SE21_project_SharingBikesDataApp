
from flask import Flask, jsonify, render_template, request
import mysql.connector
from dotenv import load_dotenv
import os
import requests
# import dbinfo
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
from call_api_single_stations import call_api_single_stations
from call_api_weather_by_latlon import call_api_weather

import joblib
# Load models once
bike_model = joblib.load("bike_availability_model.pkl")
stand_model = joblib.load("bike_stand_availability_model.pkl")

load_dotenv()



def predict_availability(station_id, hour):
        
    station_id = int(station_id)
    print("++++++++++++++++++++++++++++++++")
    print("station_id", station_id)

    # 1. Get current time and day info
    now = datetime.now()
    current_hour = now.hour
    day_of_week = now.weekday() + 1  # Monday = 1, Sunday = 7

    selected_hour = int(hour)
    print("++++++++++++++++++++++++++++++++++")
    print("selected_hour :", selected_hour )

    # If the selected time is in the past, return a warning
    if selected_hour < current_hour:
        return jsonify({
            "bikes": "Please select a future time.",
            "bike_stands": "Please select a future time."
        })

    # 2. Fetch station coordinates (latitude and longitude)
    station_info = call_api_single_stations(station_id)
    lat = station_info.get("position", {}).get("latitude")
    lon = station_info.get("position", {}).get("longitude")
    if lat is None or lon is None:
        return jsonify({"error": "Invalid station info"}), 400

    # 3. Call weather API using the coordinates
    weather_response = call_api_weather(lat, lon)

    # Calculate the index in the hourly forecast list
    index = selected_hour - current_hour
    hourly = weather_response.get("hourly", [])
    weather_hour = hourly[index]

    # Extract and convert weather data
    temperature_c = round(weather_hour.get("temp", 273.15) - 273.15, 2)  # Kelvin to Celsius
    wind_speed = weather_hour.get("wind_speed", 0.0)
    precipitation = 1 if weather_hour.get("weather", [{}])[0].get("main", "") == "Rain" else 0

    # 4. Prepare input DataFrame for prediction
    input_df = pd.DataFrame([{
        "station_id": station_id,
        "temperature": temperature_c,
        "precipitation": precipitation,
        "wind_speed": wind_speed,
        "hour": selected_hour,
        "day_of_week": day_of_week
    }])

    # 5. One-hot encode the station_id
    input_df = pd.get_dummies(input_df, columns=["station_id"])

    # 6. Load feature columns used model
    trained_columns = bike_model.feature_names_in_.tolist()


    # 7. Add any missing columns with default 0, and reorder to match training
    for col in trained_columns:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[trained_columns]

    # 8. Run predictions using the pre-trained models
    predicted_bikes = int(round(bike_model.predict(input_df)[0]))
    predicted_stands = int(round(stand_model.predict(input_df)[0]))

    # 9. Return predictions to frontend
    return jsonify({
        "bikes": predicted_bikes,
        "bike_stands": predicted_stands
    })



result = predict_availability(42, 3)
print(result)