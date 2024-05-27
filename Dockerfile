FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libhdf5-dev

RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5001
CMD ["python", "FlaskAPI/api.py"]
