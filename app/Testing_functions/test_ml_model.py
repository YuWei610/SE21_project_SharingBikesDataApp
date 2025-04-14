import unittest
import joblib
import pandas as pd

# Load trained model
bike_model = joblib.load("ML_function/bike_availability_model.pkl")

class TestMLPrediction(unittest.TestCase):
    def test_predict_bikes(self):
        # Prepare sample input data
        input_df = pd.DataFrame([{
            "station_id": 42,
            "temperature": 10.0,
            "precipitation": 0,
            "wind_speed": 3.5,
            "hour": 14,
            "day_of_week": 2
        }])

        # Apply one-hot encoding to station_id
        input_df = pd.get_dummies(input_df, columns=["station_id"])

        # Add missing columns with value 0 using efficient method
        missing_cols = [col for col in bike_model.feature_names_in_ if col not in input_df.columns]
        new_cols = pd.DataFrame(0, index=input_df.index, columns=missing_cols)

        # Combine and reorder columns to match model input
        input_df = pd.concat([input_df, new_cols], axis=1)
        input_df = input_df[bike_model.feature_names_in_]

        # Make prediction and run assertions
        prediction = bike_model.predict(input_df)[0]
        self.assertIsInstance(prediction, (int, float))
        self.assertGreaterEqual(prediction, 0)
