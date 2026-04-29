# Syncro Marketplace Backend

This is the FastAPI backend for the Syncro Universal Reverse-Auction Marketplace. It handles user authentication, profile parsing, listing operations, order management, and secure media uploads through Cloudinary.

## Technologies Used

* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - A modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.
* **Database**: [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source relational database.
* **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - The Python SQL Toolkit and Object Relational Mapper.
* **Data Validation**: [Pydantic](https://docs.pydantic.dev/latest/) - Data validation using Python type annotations.
* **Authentication**: JWT (JSON Web Tokens) with `python-jose` and password hashing via `passlib[bcrypt]`.
* **Media Storage**: [Cloudinary](https://cloudinary.com/) - Cloud-based image and video management services.
* **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) - Local development environment orchestration.

## Project Structure

```text
code/backend/
├── app/
│   ├── api/           # API Routers for auth, profiles, listings, etc.
│   ├── core/          # Core configuration, security, and exception handlers
│   ├── models/        # SQLAlchemy database models
│   ├── schemas/       # Pydantic data validation schemas
│   ├── utils/         # Helper utilities (Cloudinary upload logic)
│   ├── database.py    # Database connection logic
│   └── main.py        # FastAPI application entry point
├── .env               # Environment configurations (Not committed)
├── Dockerfile         # Docker definition for isolated runtime
└── requirements.txt   # Python dependency list
```

## Setup & Local Development

This application relies on a Docker networking architecture defined in the root folder. 

1. **Pre-requisites**: Ensure Docker Desktop is installed and running on your system.
2. **Environment File**: Verify that your `code/backend/.env` file contains your correct `DATABASE_URL`, `SECRET_KEY`, `CLOUDINARY` credentials, and your `GROQ_API_KEY`.

### Option 1: Hybrid Setup (Recommended for Active Development)
This is the safest way to develop locally. It runs the database in Docker, but runs the Python code on your host machine so you get instant live-reloading without port conflicts.

1. **Start ONLY the Database**:
   From the root folder (`SYNCRO-2YP`), start the Postgres database in the background:
   ```bash
   docker-compose up -d db
   ```

2. **Start the FastAPI Backend**:
   Navigate into the backend folder, activate your virtual environment, and run the server:
   ```bash
   cd code/backend
   python -m venv venv
   # Activate it (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```
   *The API will be available at `http://localhost:8000`.*

### Option 2: Full Docker Setup (Hands-off)
If you just want the backend running in the background and do not need live-reloading, run the entire stack via Docker.

From the root directory (`SYNCRO-2YP`), run:
```bash
docker-compose up -d --build backend db
```
*(⚠️ **Important**: Do not run this at the same time as local `uvicorn`, or you will experience port 8000 conflicts!)*

## Automatic Documentation

FastAPI automatically generates interactive API documentation based on the code routing logic and Pydantic schemas. While the server is running, you can access these debugging views at:

* **Swagger UI:** `http://localhost:8000/docs` 
* **ReDoc UI:** `http://localhost:8000/redoc`

Use these pages to test out endpoints, see the required payload structures, and view validation boundaries live via the browser!
