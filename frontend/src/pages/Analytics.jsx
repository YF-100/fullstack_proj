import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { workoutAPI } from '../services/api';
import './Analytics.css';

const Analytics = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // 'day', 'week', 'month', 'all'

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await workoutAPI.getWorkouts();
      setWorkouts(response.data);
    } catch (err) {
      setError('Failed to load workout data');
    } finally {
      setLoading(false);
    }
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

  // Filter workouts by time range
  const filterWorkoutsByTimeRange = (workoutsList) => {
    if (timeRange === 'all') return workoutsList;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let cutoffDate;
    switch (timeRange) {
      case 'day':
        cutoffDate = startOfDay;
        break;
      case 'week':
        cutoffDate = new Date(startOfDay);
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'month':
        cutoffDate = new Date(startOfDay);
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      default:
        return workoutsList;
    }

    return workoutsList.filter(w => {
      const workoutDate = new Date(w.completed_at || w.date);
      return workoutDate >= cutoffDate;
    });
  };

  const filteredWorkouts = filterWorkoutsByTimeRange(workouts);
  const activeWorkouts = filteredWorkouts.filter(w => !w.is_completed);
  const completedWorkouts = filteredWorkouts.filter(w => w.is_completed);

  // Calculate statistics (use filtered workouts)
  const totalWorkouts = filteredWorkouts.length;
  const completionRate = totalWorkouts > 0 
    ? Math.round((completedWorkouts.length / totalWorkouts) * 100) 
    : 0;
  
  const totalVolume = filteredWorkouts.reduce((total, workout) => {
    return total + (workout.exercises?.reduce((exTotal, exercise) => {
      return exTotal + (exercise.sets?.reduce((setTotal, set) => {
        return setTotal + (set.reps * set.weight);
      }, 0) || 0);
    }, 0) || 0);
  }, 0);

  const totalExercises = filteredWorkouts.reduce((total, workout) => {
    return total + (workout.exercises?.length || 0);
  }, 0);

  const totalSets = filteredWorkouts.reduce((total, workout) => {
    return total + (workout.exercises?.reduce((exTotal, exercise) => {
      return exTotal + (exercise.sets?.length || 0);
    }, 0) || 0);
  }, 0);

  // Get last 7 days workouts for activity streak
  const last7Days = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.completed_at || w.date);
    const daysDiff = Math.floor((new Date() - workoutDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }).length;

  // Average exercises per workout
  const avgExercises = totalWorkouts > 0 
    ? (totalExercises / totalWorkouts).toFixed(1) 
    : 0;

  // Average volume per workout
  const avgVolume = completedWorkouts.length > 0 
    ? (totalVolume / completedWorkouts.length).toFixed(0) 
    : 0;

  // Generate calendar data based on time range filter
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine number of days based on time range
    let numDays;
    switch (timeRange) {
      case 'day':
        numDays = 56; // 8 weeks
        break;
      case 'week':
        numDays = 7;
        break;
      case 'month':
        numDays = 30;
        break;
      case 'all':
      default:
        numDays = 56; // 8 weeks
        break;
    }
    
    // Start from numDays ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (numDays - 1));
    
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Check if there's a completed workout on this day
      const hasWorkout = completedWorkouts.some(w => {
        const workoutDate = new Date(w.completed_at || w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });
      
      // Count workouts on this day
      const workoutCount = completedWorkouts.filter(w => {
        const workoutDate = new Date(w.completed_at || w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      }).length;
      
      days.push({
        date: new Date(currentDate),
        hasWorkout,
        workoutCount,
        isToday: currentDate.getTime() === today.getTime()
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="analytics-header">
          <h1>📊 Workout Analytics</h1>
          <p>Track your progress and performance</p>
        </div>

        {/* Time Range Filter */}
        <div className="time-range-filter">
          <button
            className={`filter-btn ${timeRange === 'day' ? 'active' : ''}`}
            onClick={() => setTimeRange('day')}
          >
            Today
          </button>
          <button
            className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </button>
          <button
            className={`filter-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </button>
          <button
            className={`filter-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Statistics Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-content">
              <div className="stat-value">{totalWorkouts}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{completedWorkouts.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{activeWorkouts.length}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏋️</div>
            <div className="stat-content">
              <div className="stat-value">{totalVolume.toFixed(0)}</div>
              <div className="stat-label">Total Volume (kg)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{totalExercises}</div>
              <div className="stat-label">Total Exercises</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔢</div>
            <div className="stat-content">
              <div className="stat-value">{totalSets}</div>
              <div className="stat-label">Total Sets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{last7Days}</div>
              <div className="stat-label">Last 7 Days</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-content">
              <div className="stat-value">{avgExercises}</div>
              <div className="stat-label">Avg Exercises/Workout</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚖️</div>
            <div className="stat-content">
              <div className="stat-value">{avgVolume}</div>
              <div className="stat-label">Avg Volume/Workout (kg)</div>
            </div>
          </div>
        </div>

        {/* Workout Activity Calendar */}
        <div className="activity-calendar card">
          <h3>Workout Activity</h3>
          <div className="calendar-legend">
            <span>Less</span>
            <div className="legend-item level-0"></div>
            <div className="legend-item level-1"></div>
            <div className="legend-item level-2"></div>
            <div className="legend-item level-3"></div>
            <span>More</span>
          </div>
          <div className="calendar-container">
            <div className="calendar-day-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
            <div className="calendar-grid">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`calendar-day ${
                    day.hasWorkout 
                      ? day.workoutCount >= 2 
                        ? 'level-3' 
                        : 'level-' + Math.min(day.workoutCount, 2)
                      : 'level-0'
                  } ${day.isToday ? 'today' : ''}`}
                  title={`${day.date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}: ${day.workoutCount} workout${day.workoutCount !== 1 ? 's' : ''}`}
                >
                  <span className="day-number">{day.date.getDate()}</span>
                  {day.isToday && <div className="today-marker"></div>}
                </div>
              ))}
            </div>
          </div>
          <div className="calendar-months">
            {Array.from(new Set(calendarDays.map(d => d.date.toLocaleDateString('en-US', { month: 'short' })))).map((month, idx) => {
              const firstDayOfMonth = calendarDays.findIndex(d => d.date.toLocaleDateString('en-US', { month: 'short' }) === month);
              const columnIndex = Math.floor(firstDayOfMonth / 7);
              return (
                <span 
                  key={idx} 
                  className="month-label" 
                  style={{ gridColumn: `${columnIndex + 1} / span 1` }}
                >
                  {month}
                </span>
              );
            })}
          </div>
        </div>

        {/* Additional insights */}
        {totalWorkouts > 0 && (
          <div className="insights-section">
            <div className="insight-card card">
              <h3>🎯 Your Progress</h3>
              <p>You've completed <strong>{completedWorkouts.length}</strong> workouts with a total volume of <strong>{totalVolume.toFixed(0)} kg</strong>.</p>
              <p>Keep up the great work! You're averaging <strong>{avgExercises}</strong> exercises per workout.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;
