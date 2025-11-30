"""
Migration: Add personal stats columns to users table
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy import text
from app.db.database import engine


def upgrade():
    """Add personal stats columns to users table"""
    print("Running migration: add_user_stats")
    
    with engine.begin() as conn:
        # Add age column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER"))
            print("✓ Added age column")
        except Exception as e:
            print(f"  Age column might already exist: {e}")
        
        # Add height column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN height FLOAT"))
            print("✓ Added height column")
        except Exception as e:
            print(f"  Height column might already exist: {e}")
        
        # Add weight column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN weight FLOAT"))
            print("✓ Added weight column")
        except Exception as e:
            print(f"  Weight column might already exist: {e}")
        
        # Add gender column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR"))
            print("✓ Added gender column")
        except Exception as e:
            print(f"  Gender column might already exist: {e}")
        
        # Add fitness_goal column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN fitness_goal VARCHAR"))
            print("✓ Added fitness_goal column")
        except Exception as e:
            print(f"  Fitness_goal column might already exist: {e}")
    
    print("Migration completed: add_user_stats")


if __name__ == "__main__":
    upgrade()
