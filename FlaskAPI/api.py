import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
import pickle
from tensorflow import keras
import os

app = Flask(__name__)

# Get the directory of the current script
base_dir = os.path.dirname(os.path.abspath(__file__))



# Load the entire feature model
model_features = keras.models.load_model(os.path.join(base_dir, 'model_features.h5'))


# Load the entire target model
model_target = keras.models.load_model(os.path.join(base_dir, 'model_target.h5'))


# Load the scalers and transformers
with open(os.path.join(base_dir, 'scaler_y.pkl'), 'rb') as f:
    scaler_y = pickle.load(f)
with open(os.path.join(base_dir, 'scaler_x.pkl'), 'rb') as f:
    scaler_x = pickle.load(f)
with open(os.path.join(base_dir, 'power_transformer.pkl'), 'rb') as f:
    power_transformer = pickle.load(f)
print("Scalers and transformers loaded")

@app.route('/predict_production', methods=['POST'])
def predict_production():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    year = data.get('year', None)

    if year is None:
        return jsonify({"error": "Year is missing"}), 400

    print("Received year:", year)

    # Assuming you have 15 features and the first feature is the year
    default_features = np.zeros(15)
    default_features[0] = year

    input_data = np.array([default_features])
    input_data_power = power_transformer.transform(input_data)
    input_data_scaled = scaler_x.transform(input_data_power)
    predicted_features = model_features.predict(input_data_scaled)

    print("Predicted features:", predicted_features)

    # Concatenate the original year with the predicted features
    concatenated_features = np.concatenate((input_data_scaled, predicted_features), axis=1)

    # Use the concatenated features to predict the target
    prediction = model_target.predict(concatenated_features)
    prediction_original_scale = scaler_y.inverse_transform(prediction).flatten()

    # Convert numpy.float32 to native Python float
    prediction_result = float(prediction_original_scale[0])

    

    # Include units in the response
    response = {
        "predicted_oil_production": prediction_result,
        "units": "barrels per day"
    }

    return jsonify(response), 200

def get_year_data(filename, year):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(filename)

    # Filter the DataFrame for the specified year
    year_data = df[df['Year'] == year]

    # Check if data for the specified year exists
    if year_data.empty:
        return f"No data available for the year {year}."

    # Convert the row to a dictionary
    data_dict = year_data.iloc[0].to_dict()

    return data_dict

# route to get the data from client, when the clinet calls our flask the fetch year data will be called


@app.route('/get_year_data', methods=['POST'])
def fetch_year_data():
    # Check if the incoming request contains JSON data
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    # Get JSON data
    data = request.get_json()

    # Get the year from the JSON data
    year = data.get('year', 0)

    # Fetch data for the specified year
    filename = 'oil_updated_new.csv'  # Adjust the file path as needed
    result = get_year_data(filename, year)

    return jsonify(result), 200

if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(host='0.0.0.0', port=5001, debug=True)

