# Use the official Python 3.12 image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies required for building some python packages (like psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app directory (ignoring __pycache__ etc. via .dockerignore if applicable)
COPY app/ ./app/

# Expose the application port
EXPOSE 8000

# Command to run uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
