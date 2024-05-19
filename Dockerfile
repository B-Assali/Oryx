FROM python:3.9-slim

WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY oil_updated.csv .
COPY  model_updated.pkl .

EXPOSE 5001

CMD ["python", "app.py"]
