# 🚲 SE21_project_SharingBikesDataApp

This is a web application for Dublin bikes that shows real time information relating to the availability of bikes and bike stands in Dublin city by using dynamic data from JCDecaux's API. 

Alongside this, the application will display historical information relating to the average availability of bikes and stands on a particular day of the week. Moreover, this application utilizes a machine learning model to predict the availability of bikes and bike stands by using the geolocation of bike stations, a user selected time alongside weather forecast data retrieved from openweather API. 

The overall goal of this web application is to assist users in finding a bike and planning their journey in Dublin.


## 🗂 Project Structure

```
SE21_project_SharingBikesDataApp/
├── app/
│   ├── dublin_bikes_app_flask.py     # Flask routes
│   ├── call_api_function/            # API wrappers
│   ├── ML_function/                  # ML model + utilities
│   ├── static/                       # JS, CSS(step_by_step.js, dublin_bikes_app.css)
│   ├── templates/                    # HTML files(index.html)
│   └── Testing_functions/            # Unit and Pytest tests
├── requirements.txt
├── .env(EC2)
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set environment variables

Create a `.env` file in the EC2 root directory and include the following variables:

```
# API Keys
w_appid=YOUR_OPENWEATHER_API_KEY
b_apiKey=YOUR_JCDECAUX_API_KEY
contract=dublin
map_apikey=YOUR_GOOGLE_MAP_API_KEY

# Database Configuration
host=localhost
user=root
password=YOUR_PASSWORD
database=se21_local
port=3306
```

> ⚠️ **Important**: Add `.env` to your `.gitignore` to avoid exposing credentials on GitHub.

### 3. Run the Flask app

```bash
python app/dublin_bikes_app_flask.py
```

Then open `http://localhost:5000` (or EC2 public IP) in your browser.

---

## API Endpoints

| Method | Route                        | Description                                                   |
|--------|-----------------------------|---------------------------------------------------------------|
| `GET`  | `/get_stations`             | Fetch all station records from the database                  |
| `GET`  | `/dynamic/<station_id>`     | Fetch real-time station data from JCDecaux API               |
| `GET`  | `/get_all_stations`         | Get basic station info for dropdown selection                |
| `GET`  | `/get_weather_summary`      | Return summarized weather info for Dublin                    |
| `POST` | `/predict_availability`     | Predict bike and stand availability based on weather & time  |
| `POST` | `/filter_data`              | Filter station data and optionally return predictions        |




