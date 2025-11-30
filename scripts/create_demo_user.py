"""
Demo Data Script - Create a user with comprehensive workout, sleep, and nutrition history
This script creates a demo account showcasing all features of the GymTrack application
"""

from datetime import datetime, timedelta
from app.db.database import SessionLocal
from app.db.models import User, WorkoutSession, Exercise, WorkoutSet, SleepLog, NutritionLog
from app.services.auth import hash_password
import random

def create_demo_user():
    db = SessionLocal()
    
    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == "demo@gymtrack.com").first()
        if existing_user:
            print("Demo user already exists. Deleting old data...")
            db.delete(existing_user)
            db.commit()
        
        # Create demo user with personal stats
        demo_user = User(
            username="demo",
            email="demo@gymtrack.com",
            password=hash_password("demo123"),
            age=28,
            height=199.0,  # cm
            weight=125.0,   # kg
            gender="Male",
            fitness_goal="Muscle Gain"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"✓ Created demo user: {demo_user.username} (email: {demo_user.email})")
        print(f"  Password: demo123")
        print(f"  Age: {demo_user.age} years")
        print(f"  Height: {demo_user.height} cm")
        print(f"  Weight: {demo_user.weight} kg")
        print(f"  Gender: {demo_user.gender}")
        print(f"  Goal: {demo_user.fitness_goal}")
        
        # Create workout history (last 60 days)
        workout_templates = [
            {
                "name": "Push Day",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": [(8, 80), (8, 82.5), (8, 85), (6, 87.5)]},
                    {"name": "Incline Dumbbell Press", "sets": [(10, 32.5), (10, 32.5), (10, 35)]},
                    {"name": "Overhead Press", "sets": [(8, 50), (8, 52.5), (8, 55), (6, 57.5)]},
                    {"name": "Lateral Raises", "sets": [(12, 12.5), (12, 12.5), (12, 15)]},
                    {"name": "Tricep Dips", "sets": [(10, 0), (10, 0), (8, 10)]},
                    {"name": "Cable Tricep Pushdown", "sets": [(12, 30), (12, 32.5), (12, 35)]}
                ]
            },
            {
                "name": "Pull Day",
                "exercises": [
                    {"name": "Deadlift", "sets": [(6, 120), (6, 130), (6, 140), (4, 150)]},
                    {"name": "Pull-ups", "sets": [(8, 0), (7, 0), (6, 0)]},
                    {"name": "Barbell Rows", "sets": [(8, 70), (8, 75), (8, 80), (6, 82.5)]},
                    {"name": "Lat Pulldown", "sets": [(10, 60), (10, 65), (10, 70)]},
                    {"name": "Barbell Curl", "sets": [(10, 30), (10, 32.5), (8, 35)]},
                    {"name": "Hammer Curls", "sets": [(12, 15), (12, 17.5), (12, 17.5)]}
                ]
            },
            {
                "name": "Leg Day",
                "exercises": [
                    {"name": "Barbell Squat", "sets": [(8, 100), (8, 110), (8, 120), (6, 130)]},
                    {"name": "Romanian Deadlift", "sets": [(10, 80), (10, 85), (10, 90)]},
                    {"name": "Leg Press", "sets": [(12, 150), (12, 170), (12, 180), (10, 200)]},
                    {"name": "Leg Curl", "sets": [(12, 50), (12, 55), (12, 60)]},
                    {"name": "Leg Extension", "sets": [(12, 55), (12, 60), (12, 65)]},
                    {"name": "Calf Raises", "sets": [(15, 80), (15, 90), (15, 100), (15, 100)]}
                ]
            },
            {
                "name": "Upper Body",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": [(8, 75), (8, 80), (8, 82.5), (6, 85)]},
                    {"name": "Barbell Rows", "sets": [(8, 65), (8, 70), (8, 75)]},
                    {"name": "Overhead Press", "sets": [(10, 45), (10, 50), (8, 52.5)]},
                    {"name": "Pull-ups", "sets": [(8, 0), (7, 0), (6, 0)]},
                    {"name": "Barbell Curl", "sets": [(10, 27.5), (10, 30), (8, 32.5)]},
                    {"name": "Tricep Dips", "sets": [(10, 0), (10, 5), (8, 10)]}
                ]
            },
            {
                "name": "Full Body",
                "exercises": [
                    {"name": "Barbell Squat", "sets": [(10, 90), (10, 100), (10, 110)]},
                    {"name": "Barbell Bench Press", "sets": [(10, 70), (10, 75), (10, 77.5)]},
                    {"name": "Barbell Rows", "sets": [(10, 65), (10, 70), (10, 72.5)]},
                    {"name": "Overhead Press", "sets": [(10, 45), (10, 47.5), (10, 50)]},
                    {"name": "Romanian Deadlift", "sets": [(10, 75), (10, 80), (10, 85)]},
                    {"name": "Pull-ups", "sets": [(8, 0), (6, 0), (5, 0)]}
                ]
            }
        ]
        
        workout_count = 0
        completed_count = 0
        
        # Create workouts over the last 60 days (3-5 times per week)
        for days_ago in range(60, -1, -1):
            # Skip some days to simulate realistic workout schedule
            if random.random() > 0.6:  # ~60% chance of working out
                continue
            
            workout_date = datetime.now() - timedelta(days=days_ago)
            template = random.choice(workout_templates)
            
            workout = WorkoutSession(
                title=template["name"],
                date=workout_date,
                user_id=demo_user.id,
                is_completed=days_ago > 0,  # All past workouts are completed, today's might not be
                completed_at=workout_date + timedelta(hours=1) if days_ago > 0 else None
            )
            db.add(workout)
            db.commit()
            db.refresh(workout)
            
            # Add exercises with progressive overload (slight increase over time)
            for ex_template in template["exercises"]:
                exercise = Exercise(
                    name=ex_template["name"],
                    session_id=workout.id,
                    is_completed=days_ago > 0
                )
                db.add(exercise)
                db.commit()
                db.refresh(exercise)
                
                # Add sets with slight variation
                for reps, weight in ex_template["sets"]:
                    # Add slight progressive overload (more weight for recent workouts)
                    weight_adjustment = (60 - days_ago) * 0.1
                    adjusted_weight = weight + weight_adjustment if weight > 0 else 0
                    
                    workout_set = WorkoutSet(
                        reps=reps,
                        weight=round(adjusted_weight, 1),
                        exercise_id=exercise.id
                    )
                    db.add(workout_set)
                
                db.commit()
            
            workout_count += 1
            if days_ago > 0:
                completed_count += 1
        
        print(f"✓ Created {workout_count} workouts ({completed_count} completed, {workout_count - completed_count} in progress)")
        
        # Create sleep logs for the last 45 days
        sleep_count = 0
        for days_ago in range(45, -1, -1):
            # Skip occasional days
            if random.random() > 0.85:
                continue
            
            log_date = (datetime.now() - timedelta(days=days_ago)).date()
            
            # Generate realistic sleep data
            hours = random.uniform(6.0, 9.0)
            quality = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 25, 35, 25])[0]
            
            notes_options = [
                "Slept well, feeling refreshed",
                "Had trouble falling asleep",
                "Woke up a few times",
                "Great sleep quality",
                "Felt restless",
                "Perfect night of sleep",
                None, None  # Some logs have no notes
            ]
            
            sleep_log = SleepLog(
                date=log_date,
                hours=round(hours, 1),
                quality=quality,
                notes=random.choice(notes_options),
                user_id=demo_user.id
            )
            db.add(sleep_log)
            sleep_count += 1
        
        db.commit()
        print(f"✓ Created {sleep_count} sleep logs")
        
        # Create nutrition logs for the last 40 days
        nutrition_count = 0
        for days_ago in range(40, -1, -1):
            # Skip occasional days
            if random.random() > 0.8:
                continue
            
            log_date = (datetime.now() - timedelta(days=days_ago)).date()
            
            # Generate realistic nutrition data
            calories = random.randint(2000, 3200)
            protein = random.uniform(120, 200)
            carbs = random.uniform(200, 400)
            fats = random.uniform(50, 100)
            water = random.uniform(2.0, 4.5)
            
            notes_options = [
                "Hit my protein goal!",
                "Meal prep day",
                "Ate out for dinner",
                "Clean eating day",
                "Cheat meal included",
                "Felt energized all day",
                None, None, None  # Most logs have no notes
            ]
            
            nutrition_log = NutritionLog(
                date=log_date,
                calories=calories,
                protein=round(protein, 1),
                carbs=round(carbs, 1),
                fats=round(fats, 1),
                water=round(water, 1),
                notes=random.choice(notes_options),
                user_id=demo_user.id
            )
            db.add(nutrition_log)
            nutrition_count += 1
        
        db.commit()
        print(f"✓ Created {nutrition_count} nutrition logs")
        
        print("\n" + "="*60)
        print("✅ DEMO USER CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"\nLogin credentials:")
        print(f"  Email: demo@gymtrack.com")
        print(f"  Username: demo")
        print(f"  Password: demo123")
        print(f"\nDemo data includes:")
        print(f"  - {workout_count} workouts (Push/Pull/Legs/Upper/Full Body)")
        print(f"  - {completed_count} completed workouts")
        print(f"  - {sleep_count} sleep tracking logs")
        print(f"  - {nutrition_count} nutrition tracking logs")
        print(f"  - Progressive overload across workouts")
        print(f"  - Realistic workout completion tracking")
        print(f"  - 60 days of workout history")
        print(f"  - 45 days of sleep data")
        print(f"  - 40 days of nutrition data")
        print(f"\nFeatures demonstrated:")
        print(f"  ✓ User registration and authentication")
        print(f"  ✓ Workout creation and tracking")
        print(f"  ✓ Exercise completion marking")
        print(f"  ✓ Workout templates (Push/Pull/Legs splits)")
        print(f"  ✓ Sleep quality tracking")
        print(f"  ✓ Nutrition logging (calories, macros, water)")
        print(f"  ✓ Analytics and statistics")
        print(f"  ✓ Workout history and calendar view")
        print(f"  ✓ Active vs completed workouts")
        print(f"\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Error creating demo user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("GymTrack Demo Data Generator")
    print("="*60 + "\n")
    create_demo_user()
