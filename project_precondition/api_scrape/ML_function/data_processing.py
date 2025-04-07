# Import necessary libraries
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Load the dataset
data = pd.read_csv("bike_weather_data.csv")

# Keep only selected columns
data = data[['id', 'timestamp', 'number', 'temperature_C', 'weather_main', 'wind_speed_mps']]

# Drop rows with missing values
data.dropna(inplace=True)

# Convert timestamp to datetime
data['timestamp'] = pd.to_datetime(data['timestamp'])

# Extract hour and day of week
data['hour'] = data['timestamp'].dt.hour
data['day_of_week'] = data['timestamp'].dt.dayofweek + 1  # Make Monday=1, Sunday=7

# Drop original timestamp
data.drop(columns=['timestamp'], inplace=True)

# Rename columns to match feature names
data.rename(columns={
    'number': 'station_id',
    'temperature_C': 'temperature',
    'wind_speed_mps': 'wind_speed',
    'weather_main': 'precipitation',
}, inplace=True)

# Convert 'precipitation' to binary: Rain=1, others=0
data['precipitation'] = data['precipitation'].apply(lambda x: 1 if x == 'Rain' else 0)

# Add bike info
# Load bike availability data
availability = pd.read_csv("bike_availability_from_v3.csv")

# Convert last_update to datetime and extract hour
availability['last_update'] = pd.to_datetime(availability['last_update'])
availability['hour'] = availability['last_update'].dt.hour

# Keep only necessary columns
availability = availability[['number', 'hour', 'total_available_bikes', 'total_available_stands']]

availability.rename(columns={
    'number': 'station_id'
}, inplace=True)

# Merge with main data on station_id and hour
data = pd.merge(data, availability, on=['station_id', 'hour'], how='left')

# Rename new columns
data.rename(columns={
    'total_available_bikes': 'bike_availability',
    'total_available_stands': 'bike_stand_availability'
}, inplace=True)

# Drop rows with missing values after merge (just to be safe)
data.dropna(inplace=True)

# Show preview
print(data.head())

# Save file for ML
data.to_csv("bike_data_for_ML.csv", index=False)
