#!/bin/bash
# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the application
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000