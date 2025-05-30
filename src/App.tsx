import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import ScannerPage from './pages/ScannerPage';
import Home from './pages/Home';
import AdminMovies from './pages/AdminMovies';
import AdminUsers from './pages/AdminUsers';
import OrganizerDashboard from './pages/OrganizerDashboard';

import { getCurrentUser } from './services/auth';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/login" />;
};

const OrganizerRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  return user?.role === 'organizer' ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/booking/:movieId" element={<Booking />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/scanner" element={<ScannerPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/movies"
            element={
              <AdminRoute>
                <AdminMovies />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          
          {/* Organizer Routes */}
          <Route
            path="/organizer/dashboard"
            element={
              <PrivateRoute>
                <OrganizerDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;