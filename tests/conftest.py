import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.services.auth import create_user


# Use the SAME Postgres DB but in a clean state for each test
# This is better than SQLite because it tests the real DB behavior
from app.core.config import settings

# Create test engine (use same DB as production for integration tests)
engine = create_engine(settings.DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override get_db dependency for testing"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def reset_db():
    """Reset database before each test"""
    # Clear all data but keep tables
    from app.db.models import WorkoutSet, Exercise, WorkoutSession, SleepLog, NutritionLog, User
    
    db = TestingSessionLocal()
    try:
        # Delete in correct order to respect foreign keys
        db.query(WorkoutSet).delete()
        db.query(Exercise).delete()
        db.query(WorkoutSession).delete()
        db.query(SleepLog).delete()
        db.query(NutritionLog).delete()
        db.query(User).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error resetting DB: {e}")
    finally:
        db.close()
    yield


@pytest.fixture(scope="function")
def db():
    """Provide a database session for tests"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client():
    """Create a test client"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create a test user directly in test DB"""
    user = create_user(
        db=db,
        username="testuser",
        email="test@example.com",
        password="testpassword123"
    )
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user"""
    # Login to get token
    response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "testpassword123"
        }
    )
    
    if response.status_code != 200:
        print(f"Login failed with status {response.status_code}: {response.json()}")
        return {"Authorization": "Bearer invalid-token"}
    
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}
