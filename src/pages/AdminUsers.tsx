import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../services/api';
import { User } from '../services/auth';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [editDialog, setEditDialog] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log('editUser state changed:', editUser);
  }, [editUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const usersWithId = response.data.data.map((user: any) => ({
        ...user,
        id: user._id,
      }));
      setUsers(usersWithId);
      console.log('Users state after fetch:', usersWithId);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des utilisateurs',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setSnackbar({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur',
        severity: 'error'
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await api.post('/users', newUser);
      setOpenDialog(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
      });
      setSnackbar({
        open: true,
        message: 'Utilisateur ajouté avec succès',
        severity: 'success'
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Erreur lors de l\'ajout de l\'utilisateur',
        severity: 'error'
      });
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Editing user:', user);
    setEditUser({ ...user, id: user.id, password: '' });
    setEditDialog(true);
  };

  const handleUpdateUser = async () => {
    console.log('Attempting to update user with data:', editUser);
    try {
      if (editUser === null || editUser === undefined || editUser.id === null || editUser.id === undefined) {
        console.error('Edit user data is incomplete or missing ID.');
        setSnackbar({
          open: true,
          message: 'Erreur: Les informations de l\'utilisateur à modifier sont incomplètes.',
          severity: 'error'
        });
        return;
      }

      const { id, username, email, phone, role, password } = editUser;
      const payload: any = { username, email, phone, role };
      if (password) payload.password = password;
      const response = await api.put(`/users/${editUser.id}`, payload);
      const updated = { ...response.data.data, id: response.data.data._id };
      setUsers(users.map(u => u.id === id ? updated : u));
      setEditDialog(false);
      setSnackbar({
        open: true,
        message: 'Utilisateur modifié avec succès',
        severity: 'success'
      });
      fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Erreur lors de la modification',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gestion des Utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              console.log('User object in map:', user);
              return (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.role === 'admin'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Username"
              value={editUser?.username || ''}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editUser?.email || ''}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password (leave empty to keep current)"
              type="password"
              value={editUser?.password || ''}
              onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editUser?.phone || ''}
              onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                value={editUser?.role || 'user'}
                label="Role"
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsers; 