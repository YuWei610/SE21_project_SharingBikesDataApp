# SE21_project_SharingBikesDataApp

This is a web application for Dublin bikes that shows real time information relating to the availability of bikes and bike stands in Dublin city by using dynamic data from JCDecaux's API. 

Alongside this, the application will display historical information relating to the average availability of bikes and stands on a particular day of the week. Moreover, this application utilizes a machine learning model to predict the availability of bikes and bike stands by using the geolocation of bike stations, a user selected time alongside weather forecast data retrieved from openweather API. 

The overall goal of this web application is to assist users in finding a bike and planning their journey in Dublin.

SE21_project_SharingBikesDataApp/
├── app/
│   ├── dublin_bikes_app_flask.py   # Flask routes
│   ├── call_api_function/          # API wrappers
│   ├── ML_function/                # ML model + utilities
│   ├── static/                     # JS, CSS
│   ├── templates/                  # HTML files
│   └── Testing_functions/          # Unit and Pytest tests
├── requirements.txt
├── .env(EC2)
└── README.md
