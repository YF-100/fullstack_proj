import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { workoutAPI } from '../services/api';
import './WorkoutTemplates.css';

const WORKOUT_TEMPLATES = {
  push: {
    name: "Push Day",
    description: "Chest, Shoulders & Triceps",
    emoji: "💪",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: 8, weight: 0 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 0 },
      { name: "Overhead Press", sets: 4, reps: 8, weight: 0 },
      { name: "Lateral Raises", sets: 3, reps: 12, weight: 0 },
      { name: "Tricep Dips", sets: 3, reps: 10, weight: 0 },
      { name: "Cable Tricep Pushdown", sets: 3, reps: 12, weight: 0 }
    ]
  },
  pull: {
    name: "Pull Day",
    description: "Back & Biceps",
    emoji: "🏋️",
    exercises: [
      { name: "Deadlift", sets: 4, reps: 6, weight: 0 },
      { name: "Pull-ups", sets: 3, reps: 8, weight: 0 },
      { name: "Barbell Rows", sets: 4, reps: 8, weight: 0 },
      { name: "Lat Pulldown", sets: 3, reps: 10, weight: 0 },
      { name: "Barbell Curl", sets: 3, reps: 10, weight: 0 },
      { name: "Hammer Curls", sets: 3, reps: 12, weight: 0 }
    ]
  },
  legs: {
    name: "Leg Day",
    description: "Quads, Hamstrings & Calves",
    emoji: "🦵",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: 8, weight: 0 },
      { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 0 },
      { name: "Leg Press", sets: 4, reps: 12, weight: 0 },
      { name: "Leg Curl", sets: 3, reps: 12, weight: 0 },
      { name: "Leg Extension", sets: 3, reps: 12, weight: 0 },
      { name: "Calf Raises", sets: 4, reps: 15, weight: 0 }
    ]
  },
  upperBody: {
    name: "Upper Body",
    description: "Complete upper body workout",
    emoji: "💪",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: 8, weight: 0 },
      { name: "Barbell Rows", sets: 4, reps: 8, weight: 0 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 0 },
      { name: "Pull-ups", sets: 3, reps: 8, weight: 0 },
      { name: "Barbell Curl", sets: 3, reps: 10, weight: 0 },
      { name: "Tricep Dips", sets: 3, reps: 10, weight: 0 }
    ]
  },
  lowerBody: {
    name: "Lower Body",
    description: "Complete lower body workout",
    emoji: "🦵",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: 8, weight: 0 },
      { name: "Romanian Deadlift", sets: 4, reps: 8, weight: 0 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 0 },
      { name: "Leg Curl", sets: 3, reps: 12, weight: 0 },
      { name: "Calf Raises", sets: 4, reps: 15, weight: 0 },
      { name: "Lunges", sets: 3, reps: 10, weight: 0 }
    ]
  },
  fullBody: {
    name: "Full Body",
    description: "Complete full body workout",
    emoji: "🔥",
    exercises: [
      { name: "Barbell Squat", sets: 3, reps: 10, weight: 0 },
      { name: "Barbell Bench Press", sets: 3, reps: 10, weight: 0 },
      { name: "Barbell Rows", sets: 3, reps: 10, weight: 0 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 0 },
      { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 0 },
      { name: "Pull-ups", sets: 3, reps: 8, weight: 0 }
    ]
  },
  strength: {
    name: "Strength Training",
    description: "Low reps, heavy weight",
    emoji: "🏆",
    exercises: [
      { name: "Barbell Squat", sets: 5, reps: 5, weight: 0 },
      { name: "Barbell Bench Press", sets: 5, reps: 5, weight: 0 },
      { name: "Deadlift", sets: 5, reps: 5, weight: 0 },
      { name: "Overhead Press", sets: 4, reps: 6, weight: 0 },
      { name: "Barbell Rows", sets: 4, reps: 6, weight: 0 }
    ]
  },
  hypertrophy: {
    name: "Hypertrophy (Muscle Growth)",
    description: "Moderate reps, volume focus",
    emoji: "💯",
    exercises: [
      { name: "Incline Dumbbell Press", sets: 4, reps: 10, weight: 0 },
      { name: "Lat Pulldown", sets: 4, reps: 12, weight: 0 },
      { name: "Leg Press", sets: 4, reps: 12, weight: 0 },
      { name: "Cable Flyes", sets: 3, reps: 15, weight: 0 },
      { name: "Leg Curl", sets: 3, reps: 12, weight: 0 },
      { name: "Cable Tricep Pushdown", sets: 3, reps: 15, weight: 0 }
    ]
  }
};

function WorkoutTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectTemplate = (templateKey) => {
    const template = WORKOUT_TEMPLATES[templateKey];
    setSelectedTemplate(templateKey);
    setWorkoutName(template.name);
    setExercises(template.exercises.map((ex, idx) => ({ ...ex, id: idx })));
    setError('');
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workoutName.trim()) {
      setError('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    const invalidExercises = exercises.filter(ex => 
      !ex.name.trim() || ex.sets <= 0 || ex.reps <= 0 || ex.weight < 0
    );

    if (invalidExercises.length > 0) {
      setError('Please fill in all exercise details correctly');
      return;
    }

    try {
      setLoading(true);
      
      const workoutData = {
        title: workoutName,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: Array(ex.sets).fill().map(() => ({
            reps: ex.reps,
            weight: ex.weight
          }))
        }))
      };

      await workoutAPI.createWorkout(workoutData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create workout');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setWorkoutName('');
    setExercises([]);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="workout-templates-container">
        <div className="templates-header">
          <h1>💪 Workout Templates</h1>
          <p>Choose a professional workout plan or customize your own</p>
        </div>

      {!selectedTemplate ? (
        <div className="templates-grid">
          {Object.entries(WORKOUT_TEMPLATES).map(([key, template]) => (
            <div 
              key={key} 
              className="template-card"
              onClick={() => selectTemplate(key)}
            >
              <div className="template-emoji">{template.emoji}</div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <div className="template-info">
                {template.exercises.length} exercises
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="template-editor">
          <button className="back-button" onClick={resetForm}>
            ← Back to Templates
          </button>

          <form onSubmit={handleSubmit} className="workout-form">
            <div className="form-group">
              <label htmlFor="workoutName">Workout Name</label>
              <input
                type="text"
                id="workoutName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Monday Push Workout"
              />
            </div>

            <div className="exercises-section">
              <h3>Exercises ({exercises.length})</h3>
              
              {exercises.map((exercise) => (
                <div key={exercise.id} className="exercise-row">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="exercise-name-input"
                  />
                  
                  <div className="exercise-inputs">
                    <div className="input-group">
                      <label>Sets</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="input-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                        min="1"
                        max="50"
                      />
                    </div>

                    <div className="input-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        value={exercise.weight === 0 ? '' : exercise.weight}
                        onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      className="remove-exercise-btn"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Workout'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default WorkoutTemplates;
