import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { workoutAPI } from '../services/api';
import './CreateWorkout.css';

// Common exercises library
const COMMON_EXERCISES = [
  // Chest
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Press',
  'Chest Fly', 'Push-ups', 'Dips', 'Cable Crossover',
  // Back
  'Deadlift', 'Pull-ups', 'Lat Pulldown', 'Barbell Row', 'Dumbbell Row',
  'T-Bar Row', 'Seated Cable Row', 'Face Pulls',
  // Legs
  'Squat', 'Front Squat', 'Leg Press', 'Lunges', 'Romanian Deadlift',
  'Leg Curl', 'Leg Extension', 'Calf Raises',
  // Shoulders
  'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raises',
  'Front Raises', 'Rear Delt Fly', 'Shrugs',
  // Arms
  'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Tricep Pushdown',
  'Skull Crushers', 'Close-Grip Bench Press', 'Tricep Dips',
  // Core
  'Plank', 'Crunches', 'Leg Raises', 'Russian Twists', 'Cable Crunch'
].sort();

const CreateWorkout = () => {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState([{ 
    name: '', 
    customName: '',
    isCustom: false,
    useQuickSets: true,
    numSets: 3,
    quickReps: 10,
    quickWeight: 20,
    sets: [{ reps: 10, weight: 20 }]
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addExercise = () => {
    setExercises([...exercises, { 
      name: '', 
      customName: '',
      isCustom: false,
      useQuickSets: true,
      numSets: 3,
      quickReps: 10,
      quickWeight: 20,
      sets: [{ reps: 10, weight: 20 }]
    }]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    
    // If switching to custom, clear dropdown selection
    if (field === 'isCustom' && value === true) {
      updated[index].name = '';
    }
    // If switching from custom to dropdown, clear custom name
    if (field === 'isCustom' && value === false) {
      updated[index].customName = '';
    }
    
    setExercises(updated);
  };

  const updateQuickSets = (index) => {
    const updated = [...exercises];
    const { numSets, quickReps, quickWeight } = updated[index];
    updated[index].sets = Array(parseInt(numSets) || 1).fill(null).map(() => ({
      reps: parseInt(quickReps) || 10,
      weight: parseFloat(quickWeight) || 20
    }));
    setExercises(updated);
  };

  const toggleCustomSets = (index) => {
    const updated = [...exercises];
    updated[index].useQuickSets = !updated[index].useQuickSets;
    
    // If switching to quick sets, generate sets
    if (updated[index].useQuickSets) {
      const { numSets, quickReps, quickWeight } = updated[index];
      updated[index].sets = Array(parseInt(numSets) || 3).fill(null).map(() => ({
        reps: parseInt(quickReps) || 10,
        weight: parseFloat(quickWeight) || 20
      }));
    }
    
    setExercises(updated);
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const workoutData = {
        title,
        exercises: exercises.map(ex => ({
          name: ex.isCustom ? ex.customName : ex.name,
          sets: ex.sets.map(set => ({
            reps: parseInt(set.reps) || 10,
            weight: parseFloat(set.weight) || 20
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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="create-workout-header">
          <h1>Create New Workout</h1>
        </div>

        <form onSubmit={handleSubmit} className="workout-form card">
          <div className="form-group">
            <label htmlFor="title">Workout Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Monday Chest Day"
            />
          </div>

          <div className="exercises-section">
            <h3>Exercises</h3>
            
            {exercises.map((exercise, exIndex) => (
              <div key={exIndex} className="exercise-block card">
                <div className="exercise-header">
                  <h4>Exercise {exIndex + 1}</h4>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exIndex)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={exercise.isCustom}
                      onChange={(e) => updateExercise(exIndex, 'isCustom', e.target.checked)}
                      style={{ width: 'auto', marginRight: '8px' }}
                    />
                    Create custom exercise
                  </label>
                </div>

                {!exercise.isCustom ? (
                  <div className="form-group">
                    <label>Select Exercise *</label>
                    <select
                      value={exercise.name}
                      onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                      required={!exercise.isCustom}
                      className="exercise-select"
                    >
                      <option value="">-- Choose an exercise --</option>
                      {COMMON_EXERCISES.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Custom Exercise Name *</label>
                    <input
                      type="text"
                      value={exercise.customName}
                      onChange={(e) => updateExercise(exIndex, 'customName', e.target.value)}
                      required={exercise.isCustom}
                      placeholder="Enter custom exercise name"
                    />
                  </div>
                )}

                <div className="sets-section">
                  <div className="sets-mode-toggle">
                    <button
                      type="button"
                      onClick={() => toggleCustomSets(exIndex)}
                      className="btn btn-outline btn-sm"
                    >
                      {exercise.useQuickSets ? '🔧 Customize Sets' : '⚡ Quick Sets'}
                    </button>
                  </div>

                  {exercise.useQuickSets ? (
                    <div className="quick-sets">
                      <label>Quick Sets (same reps & weight)</label>
                      <div className="quick-sets-row">
                        <div className="quick-input">
                          <label className="input-label">Sets</label>
                          <input
                            type="number"
                            value={exercise.numSets}
                            onChange={(e) => {
                              updateExercise(exIndex, 'numSets', e.target.value);
                              setTimeout(() => updateQuickSets(exIndex), 0);
                            }}
                            min="1"
                            max="20"
                          />
                        </div>
                        <div className="quick-input">
                          <label className="input-label">Reps</label>
                          <input
                            type="number"
                            value={exercise.quickReps}
                            onChange={(e) => {
                              updateExercise(exIndex, 'quickReps', e.target.value);
                              setTimeout(() => updateQuickSets(exIndex), 0);
                            }}
                            min="1"
                            max="100"
                          />
                        </div>
                        <div className="quick-input">
                          <label className="input-label">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={exercise.quickWeight}
                            onChange={(e) => {
                              updateExercise(exIndex, 'quickWeight', e.target.value);
                              setTimeout(() => updateQuickSets(exIndex), 0);
                            }}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="quick-sets-preview">
                        Preview: {exercise.numSets} sets × {exercise.quickReps} reps @ {exercise.quickWeight} kg
                      </div>
                    </div>
                  ) : (
                    <div className="custom-sets">
                      <label>Custom Sets</label>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="set-row">
                          <span className="set-number">Set {setIndex + 1}</span>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                            placeholder="Reps"
                            min="1"
                            required
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                            placeholder="Weight (kg)"
                            min="0"
                            required
                          />
                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSet(exIndex, setIndex)}
                              className="btn btn-danger btn-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addSet(exIndex)}
                        className="btn btn-secondary btn-sm"
                      >
                        ➕ Add Set
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExercise}
              className="btn btn-secondary"
            >
              ➕ Add Exercise
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Workout'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateWorkout;
