import axios from 'axios';

// Set the base URL for API requests to point to your backend server
const API_BASE_URL = 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Existing API functions (example - keep your actual functions)
// export const getMovies = () => api.get('/movies');
// export const createBooking = (bookingData) => api.post('/bookings', bookingData);

// --- Keep your existing API functions below this line ---
// (You might need to manually add them back if they were removed by the AI)

// Example of a movie-related API function (adjust or keep your existing ones)
export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data.data;
};

export const getMovie = async (id: string) => {
  const response = await api.get(`/movies/${id}`);
  return response.data.data;
};

export const createBooking = async (bookingData: any) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
};

export const getSeatsStatus = async (params: any) => {
  const response = await api.get('/bookings/seats-status', { params });
  return response.data.data;
};

// Add functions related to organizer bookings
export const getOrganizerBookings = async () => {
  const response = await api.get('/bookings/organizer');
  return response.data.data;
};

// If you had a default export before, restore it here
// export default api; 