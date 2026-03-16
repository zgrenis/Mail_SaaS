FROM python:3.10-slim

WORKDIR /code

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyaları
COPY . .

# HF Spaces 7860 portunu bekliyor
EXPOSE 7860

CMD ["python", "-m", "app.main"]