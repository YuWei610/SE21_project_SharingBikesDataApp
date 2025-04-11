import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import matplotlib.pyplot as plt
import numpy as np

# Load preprocessed data
data = pd.read_csv("bike_data_for_ML.csv")

# # One-hot encode station_id (categorical)
# data = pd.get_dummies(data, columns=["station_id"], prefix="station")

# Define features and targets
features = [col for col in data.columns if col.startswith("station_")] + [
    'temperature', 'precipitation', 'wind_speed', 'hour', 'day_of_week'
]
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
r2_b = r2_score(y_test_b, y_pred_b)

print("📈 Bike availability - Mean Squared Error:", mse_b)
print("📈 Bike availability - R² Score:", r2_b)

# --- Stand availability model
y_stands = data[target_stands]
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X, y_stands, test_size=0.2, random_state=42)

model_stands = LinearRegression()
model_stands.fit(X_train_s, y_train_s)
y_pred_s = model_stands.predict(X_test_s)
mse_s = mean_squared_error(y_test_s, y_pred_s)
r2_s = r2_score(y_test_s, y_pred_s)

print("📈 Stand availability - Mean Squared Error:", mse_s)
print("📈 Stand availability - R² Score:", r2_s)

# Save models (commented until confirmed final version)
joblib.dump(model_bikes, "bike_availability_model.pkl")
joblib.dump(model_stands, "bike_stand_availability_model.pkl")
print("✅ Models saved as .pkl files")

# --- Plot: Bike availability
plt.figure(figsize=(6,4))
plt.scatter(y_test_b, y_pred_b, alpha=0.3)
plt.xlabel("Actual Bike Availability")
plt.ylabel("Predicted Bike Availability")
plt.title("Bike Availability: Actual vs Predicted")
plt.grid(True)
plt.tight_layout()
max_val = max(max(y_test_b), max(y_pred_b))
min_val = min(min(y_test_b), min(y_pred_b))
plt.plot([min_val, max_val], [min_val, max_val], 'r--')  # y = x line
plt.show()

# --- Plot: Stand availability
plt.figure(figsize=(6,4))
plt.scatter(y_test_s, y_pred_s, alpha=0.3, color='orange')
plt.xlabel("Actual Stand Availability")
plt.ylabel("Predicted Stand Availability")
plt.title("Stand Availability: Actual vs Predicted")
plt.grid(True)
plt.tight_layout()
max_val = max(max(y_test_s), max(y_pred_s))
min_val = min(min(y_test_s), min(y_pred_s))
plt.plot([min_val, max_val], [min_val, max_val], 'r--')  # y = x line
plt.show()
