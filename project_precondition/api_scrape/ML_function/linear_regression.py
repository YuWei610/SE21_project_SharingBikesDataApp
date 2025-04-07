import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib

# Load preprocessed data
data = pd.read_csv("bike_data_for_ML.csv")

# Define features and targets
features = ['station_id', 'temperature', 'precipitation', 'wind_speed', 'hour', 'day_of_week']
target_bikes = 'bike_availability'
target_stands = 'bike_stand_availability'

X = data[features]

# --- Bike availability model
y_bikes = data[target_bikes]
X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X, y_bikes, test_size=0.2, random_state=42)

model_bikes = LinearRegression()
model_bikes.fit(X_train_b, y_train_b)
y_pred_b = model_bikes.predict(X_test_b)
mse_b = mean_squared_error(y_test_b, y_pred_b)
print("📈 Bike availability - Mean Squared Error:", mse_b)

# --- Stand availability model
y_stands = data[target_stands]
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X, y_stands, test_size=0.2, random_state=42)

model_stands = LinearRegression()
model_stands.fit(X_train_s, y_train_s)
y_pred_s = model_stands.predict(X_test_s)
mse_s = mean_squared_error(y_test_s, y_pred_s)
print("📈 Stand availability - Mean Squared Error:", mse_s)

# Save models
joblib.dump(model_bikes, "bike_availability_model.pkl")
joblib.dump(model_stands, "bike_stand_availability_model.pkl")
print("✅ Models saved as .pkl files")
