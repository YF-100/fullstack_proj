import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { workoutAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await workoutAPI.getWorkouts();
      setWorkouts(response.data);
    } catch (err) {
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutAPI.deleteWorkout(id);
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      alert('Failed to delete workout');
    }
  };

  const handleToggleExercise = async (workoutId, exerciseId) => {
    try {
      await workoutAPI.toggleExerciseComplete(workoutId, exerciseId);
      
      // Update local state
      setWorkouts(workouts.map(workout => {
        if (workout.id === workoutId) {
          const updatedExercises = workout.exercises.map(ex => 
            ex.id === exerciseId ? { ...ex, is_completed: !ex.is_completed } : ex
          );
          
          // Check if all exercises are now completed
          const allCompleted = updatedExercises.every(ex => ex.is_completed);
          
          return {
            ...workout,
            exercises: updatedExercises,
            is_completed: allCompleted,
            completed_at: allCompleted ? new Date().toISOString() : workout.completed_at
          };
        }
        return workout;
      }));
    } catch (err) {
      alert('Failed to update exercise');
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

  const activeWorkouts = workouts.filter(w => !w.is_completed);
  const completedWorkouts = workouts.filter(w => w.is_completed);
  const displayWorkouts = showCompleted ? completedWorkouts : activeWorkouts;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>My Workouts</h1>
          <div className="header-actions">
            <Link to="/create-workout" className="btn btn-primary">
              ➕ New Workout
            </Link>
          </div>
        </div>

        <div className="workout-tabs">
          <button
            className={`tab-button ${!showCompleted ? 'active' : ''}`}
            onClick={() => setShowCompleted(false)}
          >
            Active ({activeWorkouts.length})
          </button>
          <button
            className={`tab-button ${showCompleted ? 'active' : ''}`}
            onClick={() => setShowCompleted(true)}
          >
            History ({completedWorkouts.length})
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {displayWorkouts.length === 0 ? (
          <div className="empty-state card">
            <h2>{showCompleted ? 'No completed workouts' : 'No active workouts'}</h2>
            <p>
              {showCompleted 
                ? 'Complete workouts to see them in your history!' 
                : 'Start tracking your fitness journey by creating your first workout!'}
            </p>
            {!showCompleted && (
              <Link to="/create-workout" className="btn btn-primary">
                Create Workout
              </Link>
            )}
          </div>
        ) : (
          <div className="workouts-grid">
            {displayWorkouts.map((workout) => (
              <div key={workout.id} className={`workout-card card ${workout.is_completed ? 'completed' : ''}`}>
                <div className="workout-header">
                  <h3>
                    {workout.title}
                    {workout.is_completed && <span className="completed-indicator">✓</span>}
                  </h3>
                  <span className="workout-date">{formatDate(workout.date)}</span>
                </div>

                {workout.is_completed && workout.completed_at && (
                  <div className="completion-info">
                    Completed: {formatDate(workout.completed_at)}
                  </div>
                )}

                {!workout.is_completed && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(workout.exercises?.filter(ex => ex.is_completed).length / workout.exercises?.length * 100) || 0}%` 
                      }}
                    ></div>
                    <span className="progress-text">
                      {workout.exercises?.filter(ex => ex.is_completed).length || 0} / {workout.exercises?.length || 0} exercises done
                    </span>
                  </div>
                )}
                
                <div className="workout-stats">
                  <div className="stat">
                    <span className="stat-label">Exercises</span>
                    <span className="stat-value">{workout.exercises?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Sets</span>
                    <span className="stat-value">
                      {workout.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0}
                    </span>
                  </div>
                </div>

                <div className="workout-exercises">
                  {workout.exercises?.map((exercise, idx) => (
                    <div key={exercise.id || idx} className="exercise-item">
                      <label className="exercise-checkbox-label">
                        <input
                          type="checkbox"
                          checked={exercise.is_completed || false}
                          onChange={() => handleToggleExercise(workout.id, exercise.id)}
                          disabled={workout.is_completed}
                          className="exercise-checkbox"
                        />
                        <span className={`exercise-name ${exercise.is_completed ? 'completed' : ''}`}>
                          {exercise.name}
                        </span>
                        <span className="exercise-sets">({exercise.sets?.length || 0} sets)</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="workout-actions">
                  <Link to={`/workout/${workout.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
