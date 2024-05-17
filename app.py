import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)  # flask instance


def get_year_data(filename, year):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(filename)

    # Filter the DataFrame for the specified year
    year_data = df[df['Years'] == year]

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
    filename = 'oil_updated.csv'  # Adjust the file path as needed
    result = get_year_data(filename, year)

    return jsonify(result), 200

# model = joblib.load('your_model.joblib')  # Update 'your_model.joblib' with your actual model file


@app.route('/predict_production', methods=['POST'])
def predict_production():
    # Check if the incoming request contains JSON data
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    # Get JSON data
    data = request.get_json()

    # Get the input year from JSON data
    # Assuming the JSON data contains the year required for prediction
    year = np.array(data.get('year', 0))
    input_year = year.reshape(-1, 1)

    if not year:
        return jsonify({"error": "Input year are missing"}), 400

    # Load your trained machine learning model
    model = pickle.load(open('model_updated.pkl', 'rb'))  # model is in file

    # year_input = pd.read_json(year)

    # Make predictions using your model
    prediction = model.predict(input_year)
    predictions_list = prediction.tolist()

    # Return the prediction
    return jsonify({"prediction": predictions_list}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
