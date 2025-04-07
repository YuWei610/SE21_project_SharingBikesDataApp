import joblib
import pandas as pd

# Load both models
bike_model = joblib.load('bike_availability_model.pkl')
stand_model = joblib.load('bike_stand_availability_model.pkl')

# Prepare input features (must match training format)
sample = pd.DataFrame([{
    'station_id': 1,
    'temperature': 12.0,
    'precipitation': 0,
    'wind_speed': 8.5,
    'hour': 9,
    'day_of_week': 5
}])

# Predict with both models
bike_prediction = bike_model.predict(sample)
stand_prediction = stand_model.predict(sample)

# Print predictions
print("🚲 Predicted bike availability:", round(bike_prediction[0]))
print("🅿️ Predicted stand availability:", round(stand_prediction[0]))
