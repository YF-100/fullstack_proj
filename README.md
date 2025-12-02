# GymTrack - Workout Tracking Web API

![Tests](https://github.com/YF-100/fullstack_proj/actions/workflows/tests.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-81%25-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)

**GymTrack** is a full-stack workout tracking application built with FastAPI, PostgreSQL, and React that allows users to track their workout sessions, exercises, and sets. This project demonstrates modern web development practices including containerization, authentication, responsive UI design, and comprehensive testing.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [Course Requirements](#-course-requirements)

## 🎯 Project Overview

GymTrack is developed as part of the **E5 DSIA 5102A - Application Fullstack data** course. It provides a REST API for managing workout data with the following capabilities:

- User registration and authentication
- Create and manage workout sessions
- Track exercises within workouts
- Record sets (reps and weight) for each exercise
- Secure API access with JWT tokens

## ✨ Features

### User Management
- ✅ User registration with email validation
- ✅ Secure login with JWT authentication
- ✅ User profile management
- ✅ Account deletion

### Workout Tracking
- ✅ Create workout sessions with custom titles
- ✅ Add multiple exercises to each workout
- ✅ Record sets (repetitions and weight) for each exercise
- ✅ View all workouts with pagination
- ✅ Update workout information
- ✅ Delete workouts and exercises

### Security
- ✅ Password hashing with PBKDF2-HMAC-SHA256
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ User-specific data access control

## 🛠 Technology Stack

### Backend
- **Python 3.12** - Programming language
- **FastAPI** - Modern async web framework
- **PostgreSQL 16** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation using Python type annotations

### Frontend
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **React Router 6.21** - Client-side routing
- **Axios 1.6.5** - HTTP client
- **Context API** - State management
- **CSS Variables** - Theming and styling

### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
- **PBKDF2-HMAC-SHA256** - Password hashing (Django-style)
- **python-jose** - JWT encoding/decoding
- **Protected Routes** - Frontend route guards

### Infrastructure
- **Docker** - Application containerization
- **Docker Compose** - Multi-container orchestration (API, DB, Frontend)
- **uvicorn** - ASGI server
- **Node.js 20** - Frontend runtime

### Testing
- **pytest** - Backend testing framework
- **pytest-cov** - Code coverage (81%)
- **httpx** - HTTP client for testing
- **TestClient** - FastAPI test client

## 📁 Project Structure

```
fullstack_proj/
├── app/                            # Backend application
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Configuration and settings
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py             # Database connection and session
│   │   └── models.py               # SQLAlchemy models (User, Workout, Exercise, etc.)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── users.py                # User Pydantic schemas
│   │   ├── workouts.py             # Workout Pydantic schemas
│   │   └── tracking.py             # Sleep & Nutrition schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py                 # Authentication logic (JWT, password hashing)
│   │   └── workouts.py             # Workout business logic
│   └── api/
│       ├── __init__.py
│       ├── deps.py                 # API dependencies (get_current_user)
│       └── routers/
│           ├── __init__.py
│           ├── auth.py             # Authentication endpoints (login, register)
│           ├── users.py            # User management endpoints (CRUD)
│           ├── workouts.py         # Workout endpoints (CRUD + exercises)
│           └── tracking.py         # Sleep & Nutrition tracking endpoints
├── tests/                          # Backend tests (31 tests, 81% coverage)
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures (test DB, client, users)
│   ├── unit/                       # Unit tests (12 tests)
│   │   ├── __init__.py
│   │   ├── test_auth_service.py    # Auth service tests (hash, JWT)
│   │   └── test_workout_service.py # Workout service tests
│   └── integration/                # Integration tests (19 tests)
│       ├── __init__.py
│       ├── test_auth_api.py        # Auth API tests (login, register)
│       ├── test_users_api.py       # User API tests (CRUD)
│       └── test_workouts_api.py    # Workout API tests (full flow)
├── scripts/                        # Utility scripts
│   └── create_demo_user.py         # Demo user with 60 days of data
├── frontend/                       # React frontend
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Dashboard.jsx       # Workout list
│   │   │   ├── WorkoutDetail.jsx   # Single workout view
│   │   │   ├── CreateWorkout.jsx   # Workout creation
│   │   │   ├── Profile.jsx         # User profile
│   │   │   └── *.css               # Page styles
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── .env                        # Frontend environment variables
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── tests.yml               # GitHub Actions CI/CD (unit + integration tests)
├── .env                            # Backend environment variables
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore (node_modules, __pycache__, etc.)
├── docker-compose.yml              # Multi-service orchestration (db, api, frontend)
├── Dockerfile                      # Backend container definition
├── pytest.ini                      # Pytest configuration
├── requirements.txt                # Python dependencies
├── setup_and_demo.sh               # 🚀 Complete setup script (Docker + tests + demo)
├── run_tests.sh                    # Quick test runner
└── README.md                       # Main documentation (this file)
```

## 🚀 Installation & Setup

### Prerequisites

- Docker and Docker Compose installed
- Git (optional)

### 🎯 Installation Automatique (Recommandée)

**Pour une installation complète en une seule commande** (inclut Docker, utilisateur démo, tests):

```bash
./setup_and_demo.sh
```

Ce script fait **TOUT automatiquement**:
- ✅ Vérifie les prérequis (Docker, Docker Compose)
- ✅ Nettoie et construit tous les services
- ✅ Démarre Database + API + Frontend
- ✅ Crée un utilisateur démo avec 60 jours de données réalistes
- ✅ Lance les 31 tests (81% coverage)
- ✅ Affiche les URLs et informations de connexion

**Compte de démonstration créé automatiquement:**
- 👤 **Username**: `demo`
- 🔑 **Password**: `demo123`
- 📊 **Données**: 35 entraînements, 42 logs de sommeil, 31 logs nutrition

**Accès après installation:**
- **Application Web**: http://localhost:3000
- **Documentation API**: http://localhost:8000/docs

---

### Installation Manuelle

#### Quick Start

1. **Clone the repository** (or download the project files):
   ```bash
   git clone <repository-url>
   cd fullstack_proj
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the `SECRET_KEY` for production:
   ```env
   SECRET_KEY=your-secure-secret-key-at-least-32-characters
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```
   
   This will start:
   - **PostgreSQL Database** on port 5432
   - **Backend API** on port 8000
   - **Frontend App** on port 3000

4. **Create demo user with sample data** (optional, in a new terminal):
   ```bash
   docker-compose exec api python scripts/create_demo_user.py
   ```
   
   This creates a demo user (username: `demo`, password: `demo123`) with 60 days of realistic workout, sleep, and nutrition data.

5. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:8000
   - **API Documentation (Swagger)**: http://localhost:8000/docs
   - **Alternative Documentation (ReDoc)**: http://localhost:8000/redoc

### Manual Setup (Without Docker)

1. **Install PostgreSQL** and create a database:
   ```sql
   CREATE DATABASE gymtrack;
   CREATE USER gymtrack WITH PASSWORD 'gymtrack';
   GRANT ALL PRIVILEGES ON DATABASE gymtrack TO gymtrack;
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export DATABASE_URL=postgresql://gymtrack:gymtrack@localhost:5432/gymtrack
   export SECRET_KEY=your-secret-key
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=password123
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### User Endpoints (Authenticated)

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

### Workout Endpoints (Authenticated)

#### Create Workout
```http
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Monday Workout",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        {"reps": 10, "weight": 60.0},
        {"reps": 8, "weight": 65.0}
      ]
    }
  ]
}
```

#### List Workouts
```http
GET /api/workouts?skip=0&limit=100
Authorization: Bearer <token>
```

#### Get Workout by ID
```http
GET /api/workouts/{workout_id}
Authorization: Bearer <token>
```

#### Update Workout
```http
PUT /api/workouts/{workout_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Workout Title"
}
```

#### Delete Workout
```http
DELETE /api/workouts/{workout_id}
Authorization: Bearer <token>
```

#### Add Exercise to Workout
```http
POST /api/workouts/{workout_id}/exercises
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Squats",
  "sets": [
    {"reps": 12, "weight": 80.0}
  ]
}
```

For complete API documentation with examples, visit http://localhost:8000/docs after starting the application.

## 🎨 Frontend Application

The React frontend provides a modern, responsive interface for interacting with the GymTrack API.

### Features
- **Authentication Pages**: Login and registration with form validation
- **Dashboard**: View all workouts with summary statistics
- **Workout Detail**: View individual workout with all exercises and sets
- **Create Workout**: Dynamic form to build workouts with multiple exercises and sets
- **Profile Management**: Update user information and manage account
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Responsive Design**: Mobile-friendly interface with modern UI

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx      # Navigation bar with auth state
│   │   └── ProtectedRoute.jsx  # Route guard component
│   ├── context/            # Global state management
│   │   └── AuthContext.jsx # Authentication state and methods
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # Workout list
│   │   ├── WorkoutDetail.jsx  # Individual workout view
│   │   ├── CreateWorkout.jsx  # Workout creation form
│   │   └── Profile.jsx     # User profile management
│   ├── services/           # API integration
│   │   └── api.js          # Axios client with interceptors
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # React entry point
```

### Running Frontend Independently

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

### Environment Variables

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

The project includes comprehensive unit and integration tests using pytest.

### Run All Tests
```bash
# Using Docker
docker-compose exec api pytest

# Local
pytest
```

### Run Tests with Coverage
```bash
# Using Docker
docker-compose exec api pytest --cov=app --cov-report=html

# Local
pytest --cov=app --cov-report=html
```

View coverage report by opening `htmlcov/index.html` in your browser.

### Run Specific Test Files
```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# Specific test file
pytest tests/unit/test_auth_service.py
```

### Test Structure

- **Unit Tests**: Test individual functions and services in isolation
  - `test_auth_service.py` - Authentication logic tests
  - `test_workout_service.py` - Workout business logic tests

- **Integration Tests**: Test API endpoints end-to-end
  - `test_auth_api.py` - Authentication API tests
  - `test_users_api.py` - User management API tests
  - `test_workouts_api.py` - Workout API tests

## 🔒 Security

### Password Security
- Passwords are hashed using **PBKDF2-HMAC-SHA256** with 260,000 iterations
- Salt is randomly generated for each password
- Passwords are never stored in plain text

### JWT Authentication
- Access tokens expire after 30 minutes (configurable)
- Tokens are signed with a secret key (HS256 algorithm)
- Protected routes require valid JWT tokens

### Best Practices Implemented
- ✅ Environment variables for sensitive data
- ✅ Password complexity requirements (min 6 characters)
- ✅ User-specific data access control
- ✅ Proper HTTP status codes and error messages
- ✅ CORS configuration for production

### Production Recommendations
1. Change the `SECRET_KEY` in `.env` to a strong random value
2. Use HTTPS in production
3. Configure CORS to allow only specific origins
4. Implement rate limiting
5. Add account lockout after failed login attempts
6. Implement password reset functionality
7. Add email verification for new accounts

## 🔮 Future Improvements

### Features to Add
- [ ] Workout statistics and analytics
  - Total volume per exercise
  - Progress tracking over time
  - Personal records (PRs)
  - Workout frequency charts
- [ ] Social features
  - Share workouts with friends
  - Public workout templates
  - Follow other users
- [ ] Advanced workout features
  - Rest timer between sets
  - Workout templates
  - Exercise library with instructions
  - Progress photos
- [ ] Mobile application
  - React Native app
  - Offline mode with sync
- [ ] Export/Import
  - Export workouts to CSV/PDF
  - Import from other fitness apps

### Technical Improvements
- [ ] Add caching (Redis) for frequently accessed data
- [ ] Implement background tasks (Celery) for analytics
- [ ] Add database migrations (Alembic)
- [ ] Implement API rate limiting
- [ ] Add request validation and sanitization
- [ ] Implement refresh tokens
- [ ] Add logging and monitoring
- [ ] Performance optimization and indexing

## 📖 Course Requirements

This project fulfills all requirements for the **E5 DSIA 5102A - Application Fullstack data** course:

### ✅ Technical Requirements
- [x] **Docker & Docker Compose**: Multi-service architecture (API + Database)
- [x] **FastAPI**: Modern async web framework
- [x] **PostgreSQL**: Relational database
- [x] **SQLAlchemy**: ORM for database operations
- [x] **Pydantic**: Data validation and schemas
- [x] **JWT Authentication**: Secure token-based auth
- [x] **PBKDF2-HMAC-SHA256**: Custom password hashing implementation
- [x] **pytest**: Comprehensive testing with fixtures and mocking
- [x] **Clean Architecture**: Layered structure (API, Service, Data layers)
- [x] **REST API**: RESTful endpoints with proper HTTP methods
- [x] **Error Handling**: Proper HTTP status codes and error responses
- [x] **Environment Variables**: Configuration management

### ✅ Project Structure
- [x] Clear separation of concerns (routers, services, models, schemas)
- [x] Dependency injection with FastAPI's `Depends`
- [x] Proper project documentation (README)
- [x] Test coverage (unit + integration tests)
- [x] Docker containerization
- [x] Database seeding script

### ✅ Best Practices
- [x] Type hints throughout the codebase
- [x] Async/await patterns where applicable
- [x] Proper error handling and validation
- [x] Security best practices (password hashing, JWT)
- [x] Code organization and modularity
- [x] Comprehensive API documentation (Swagger/ReDoc)

## 👨‍💻 Development

### Project Setup for Development
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run in development mode
uvicorn app.main:app --reload
```

### Database Management
```bash
# Access PostgreSQL in Docker
docker-compose exec db psql -U gymtrack -d gymtrack

# View logs
docker-compose logs -f api
docker-compose logs -f db

# Restart services
docker-compose restart
```


##  Acknowledgments

- FastAPI documentation and community
- SQLAlchemy documentation
- Course instructors at ESIEE Paris
- Django's password hashing implementation (inspiration for PBKDF2)

---

**Course**: E5 DSIA 5102A - Application Fullstack data  
**Institution**: ESIEE Paris  
**Year**: 2025  
**Authors**: Yassin Farahat & Seongjag AHN
