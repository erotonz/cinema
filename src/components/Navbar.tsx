import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { isAuthenticated, logout, getCurrentUser } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Cinema Website
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/movies')}>
            Movies
          </Button>
          
          {isAuthenticated() ? (
            <>
              {user?.role === 'admin' && (
                <>
                <Button color="inherit" onClick={() => navigate('/admin/movies')}>
                    Gérer Films
                  </Button>
                  <Button color="inherit" onClick={() => navigate('/admin/users')}>
                    Gérer Utilisateurs
                </Button>
                </>
              )}
              {user?.role === 'organizer' && (
                <Button color="inherit" onClick={() => navigate('/organizer/dashboard')}>
                  Gérer Commentaires
                </Button>
              )}
              <Typography variant="body1">
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;