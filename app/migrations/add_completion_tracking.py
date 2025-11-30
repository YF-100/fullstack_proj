"""Add completion tracking columns

Adds is_completed and completed_at columns to workout_sessions
and is_completed column to exercises table
"""

from sqlalchemy import text
from app.db.database import engine


def upgrade():
    """Add completion tracking columns"""
    with engine.connect() as conn:
        # Add is_completed to workout_sessions
        try:
            conn.execute(text("""
                ALTER TABLE workout_sessions 
                ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE
            """))
            conn.commit()
            print("✓ Added is_completed column to workout_sessions")
        except Exception as e:
            print(f"is_completed column may already exist in workout_sessions: {e}")
        
        # Add completed_at to workout_sessions
        try:
            conn.execute(text("""
                ALTER TABLE workout_sessions 
                ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE
            """))
            conn.commit()
            print("✓ Added completed_at column to workout_sessions")
        except Exception as e:
            print(f"completed_at column may already exist in workout_sessions: {e}")
        
        # Add is_completed to exercises
        try:
            conn.execute(text("""
                ALTER TABLE exercises 
                ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE
            """))
            conn.commit()
            print("✓ Added is_completed column to exercises")
        except Exception as e:
            print(f"is_completed column may already exist in exercises: {e}")


def downgrade():
    """Remove completion tracking columns"""
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE workout_sessions DROP COLUMN is_completed"))
            conn.execute(text("ALTER TABLE workout_sessions DROP COLUMN completed_at"))
            conn.execute(text("ALTER TABLE exercises DROP COLUMN is_completed"))
            conn.commit()
            print("✓ Removed completion tracking columns")
        except Exception as e:
            print(f"Error removing columns: {e}")


if __name__ == "__main__":
    print("Running migration: Add completion tracking columns...")
    upgrade()
    print("Migration complete!")
