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
2. **Environment File**: Verify that your `code/backend/.env` file contains your correct `DATABASE_URL`, `SECRET_KEY`, and `CLOUDINARY` credentials.

### Running with Docker (Recommended)

To start the backend server along with the PostgreSQL database and frontend, simply run the following from the root directory (`d:\Computer Engineering\Semester 3\Software Systems Design Project CO2060\e22-co2060-Syncro`):

```bash
docker-compose up -d --build backend db
```

The FastAPI application will be securely bound and available locally at:
**`http://localhost:8000`**

### Running the Python Environment Locally (Without Docker)

If you need to run the pure Python engine directly on your host machine for deep script execution or debugging:

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   * Windows: `venv\Scripts\activate`
   * Unix/MacOS: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Uvicorn server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Automatic Documentation

FastAPI automatically generates interactive API documentation based on the code routing logic and Pydantic schemas. While the server is running, you can access these debugging views at:

* **Swagger UI:** `http://localhost:8000/docs` 
* **ReDoc UI:** `http://localhost:8000/redoc`

Use these pages to test out endpoints, see the required payload structures, and view validation boundaries live via the browser!
