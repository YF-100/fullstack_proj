import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
};

// User endpoints
export const userAPI = {
  getCurrentUser: () => api.get('/api/users/me'),
  updateUser: (userData) => api.put('/api/users/me', userData),
  deleteUser: () => api.delete('/api/users/me'),
};

// Workout endpoints
export const workoutAPI = {
  getWorkouts: (skip = 0, limit = 100) => 
    api.get(`/api/workouts?skip=${skip}&limit=${limit}`),
  getWorkout: (id) => api.get(`/api/workouts/${id}`),
  createWorkout: (workoutData) => api.post('/api/workouts', workoutData),
  updateWorkout: (id, workoutData) => api.put(`/api/workouts/${id}`, workoutData),
  deleteWorkout: (id) => api.delete(`/api/workouts/${id}`),
  addExercise: (workoutId, exerciseData) => 
    api.post(`/api/workouts/${workoutId}/exercises`, exerciseData),
  deleteExercise: (exerciseId) => api.delete(`/api/workouts/exercises/${exerciseId}`),
  toggleExerciseComplete: (workoutId, exerciseId) => 
    api.patch(`/api/workouts/${workoutId}/exercises/${exerciseId}/complete`),
  markWorkoutComplete: (workoutId) => 
    api.patch(`/api/workouts/${workoutId}/complete`),
};

// Sleep tracking endpoints
export const sleepAPI = {
  getSleepLogs: (skip = 0, limit = 30) => 
    api.get(`/api/tracking/sleep?skip=${skip}&limit=${limit}`),
  getSleepLog: (id) => api.get(`/api/tracking/sleep/${id}`),
  createSleepLog: (data) => api.post('/api/tracking/sleep', data),
  updateSleepLog: (id, data) => api.put(`/api/tracking/sleep/${id}`, data),
  deleteSleepLog: (id) => api.delete(`/api/tracking/sleep/${id}`),
};

// Nutrition tracking endpoints
export const nutritionAPI = {
  getNutritionLogs: (skip = 0, limit = 30) => 
    api.get(`/api/tracking/nutrition?skip=${skip}&limit=${limit}`),
  getNutritionLog: (id) => api.get(`/api/tracking/nutrition/${id}`),
  createNutritionLog: (data) => api.post('/api/tracking/nutrition', data),
  updateNutritionLog: (id, data) => api.put(`/api/tracking/nutrition/${id}`, data),
  deleteNutritionLog: (id) => api.delete(`/api/tracking/nutrition/${id}`),
};

export default api;
