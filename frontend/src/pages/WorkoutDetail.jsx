import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { workoutAPI } from '../services/api';
import './WorkoutDetail.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingExercise, setUpdatingExercise] = useState(null);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await workoutAPI.getWorkout(id);
      setWorkout(response.data);
    } catch (err) {
      setError('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutAPI.deleteWorkout(id);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete workout');
    }
  };

  const toggleExerciseComplete = async (exerciseId) => {
    try {
      setUpdatingExercise(exerciseId);
      const response = await workoutAPI.toggleExerciseComplete(id, exerciseId);
      setWorkout(response.data);
    } catch (err) {
      alert('Failed to update exercise');
    } finally {
      setUpdatingExercise(null);
    }
  };

  const markAllComplete = async () => {
    if (!window.confirm('Mark all exercises as complete?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await workoutAPI.markWorkoutComplete(id);
      setWorkout(response.data);
    } catch (err) {
      alert('Failed to complete workout');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalVolume = (exercise) => {
    return exercise.sets.reduce((total, set) => {
      return total + (set.reps * set.weight);
    }, 0).toFixed(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (error || !workout) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error">{error || 'Workout not found'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="workout-detail-header">
          <div>
            <h1>
              {workout.title}
              {workout.is_completed && <span className="completed-badge">✓ Completed</span>}
            </h1>
            <p className="workout-date">{formatDate(workout.date)}</p>
            {workout.completed_at && (
              <p className="completion-date">
                Completed: {formatDate(workout.completed_at)}
              </p>
            )}
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
              ← Back
            </button>
            {!workout.is_completed && (
              <button onClick={markAllComplete} className="btn btn-success">
                ✓ Mark All Complete
              </button>
            )}
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Workout
            </button>
          </div>
        </div>

        <div className="workout-summary card">
          <h3>Workout Summary</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Total Exercises</span>
              <span className="stat-value">{workout.exercises?.length || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Sets</span>
              <span className="stat-value">
                {workout.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Volume</span>
              <span className="stat-value">
                {workout.exercises?.reduce((total, ex) => {
                  return total + ex.sets.reduce((exTotal, set) => exTotal + (set.reps * set.weight), 0);
                }, 0).toFixed(1) || 0} kg
              </span>
            </div>
          </div>
        </div>

        <div className="exercises-list">
          {workout.exercises?.map((exercise, idx) => (
            <div key={exercise.id} className={`exercise-detail card ${exercise.is_completed ? 'completed' : ''}`}>
              <div className="exercise-detail-header">
                <div className="exercise-header-left">
                  <input
                    type="checkbox"
                    checked={exercise.is_completed}
                    onChange={() => toggleExerciseComplete(exercise.id)}
                    disabled={updatingExercise === exercise.id || workout.is_completed}
                    className="exercise-checkbox"
                  />
                  <h3>
                    🏋️ {exercise.name}
                    {exercise.is_completed && <span className="check-mark">✓</span>}
                  </h3>
                </div>
                <span className="volume-badge">
                  Volume: {calculateTotalVolume(exercise)} kg
                </span>
              </div>

              <div className="sets-table">
                <div className="sets-table-header">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight (kg)</span>
                  <span>Volume (kg)</span>
                </div>
                {exercise.sets.map((set, setIdx) => (
                  <div key={set.id} className="sets-table-row">
                    <span>{setIdx + 1}</span>
                    <span>{set.reps}</span>
                    <span>{set.weight}</span>
                    <span>{(set.reps * set.weight).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WorkoutDetail;
