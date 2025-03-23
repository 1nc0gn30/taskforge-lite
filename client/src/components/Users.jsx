import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PersonAdd, 
  Refresh, 
  Search, 
  Delete, 
  Edit, 
  Mail, 
  Person,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({ name: '', email: '' });

  // Fetch users with better error handling
  const fetchUsers = async () => {
    setFetchLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
      showAlert('Users loaded successfully', 'success');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showAlert('Failed to load users. Please try again.', 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = { name: '', email: '' };
    let isValid = true;

    if (!form.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Create new user with validation
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '' });
      fetchUsers();
      showAlert('User created successfully!', 'success');
    } catch (err) {
      console.error('User creation failed:', err);
      showAlert('Failed to create user. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdate = async () => {
    if (!validateForm() || !editingId) return;
    
    setLoading(true);
    try {
      await api.put(`/users/${editingId}`, form);
      setForm({ name: '', email: '' });
      setEditingId(null);
      fetchUsers();
      showAlert('User updated successfully!', 'success');
    } catch (err) {
      console.error('User update failed:', err);
      showAlert('Failed to update user. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      showAlert('User deleted successfully!', 'success');
    } catch (err) {
      console.error('User deletion failed:', err);
      showAlert('Failed to delete user. Please try again.', 'error');
    }
  };

  // Edit user setup
  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email });
    setEditingId(user.id);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setForm({ name: '', email: '' });
    setEditingId(null);
    setFormErrors({ name: '', email: '' });
  };

  // Show alert helper
  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Filter users based on search term
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term.toLowerCase()) || 
      user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get random pastel color for avatar background
  const getAvatarColor = (name) => {
    const colors = [
      '#FFD6C1', '#C1FFD6', '#C1D6FF', '#FFC1D6', 
      '#D6FFC1', '#D6C1FF', '#FFFFC1', '#FFB266'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          User Management
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item="true" size={{xs: 12, md: 5}}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: '#f8faff',
              position: 'sticky',
              top: 20,
            }}
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                {editingId ? 'Edit User' : 'Add New User'}
              </Typography>
            </Box>
            
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ mb: 3 }}
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ mb: 3 }}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : editingId ? <Edit /> : <PersonAdd />}
                sx={{ 
                  flex: 1,
                  py: 1,
                  backgroundColor: editingId ? 'success.main' : 'primary.main',
                  '&:hover': {
                    backgroundColor: editingId ? 'success.dark' : 'primary.dark',
                  }
                }}
              >
                {loading ? 'Processing...' : editingId ? 'Update User' : 'Add User'}
              </Button>
              
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  startIcon={<Cancel />}
                  color="error"
                  sx={{ flex: 1, py: 1 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Users List */}
        <Grid item="true" size={{xs: 12, md: 7}}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                Users Directory
                <Chip 
                  label={filteredUsers.length} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="Search users..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200, color: '#fff', backgroundColor: 'white' }}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchUsers} disabled={fetchLoading}>
                    {fetchLoading ? <CircularProgress size={24} /> : <Refresh />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {fetchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Paper
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? 'No users match your search' : 'No users found'}
                </Typography>
                {searchTerm && (
                  <Button 
                    variant="text" 
                    onClick={() => handleSearch('')}
                    sx={{ mt: 1 }}
                  >
                    Clear search
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={2}>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <Grid key={user.id} item="true" size={{ xs: 12, sm: searchTerm ? 12 : 12 }}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          elevation={2}
                          sx={{
                            transition: '0.3s',
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'visible',
                            '&:hover': {
                              boxShadow: 8,
                              transform: 'translateY(-4px)',
                            },
                            border: editingId === user.id ? '2px solid' : 'none',
                            borderColor: 'primary.main',
                          }}
                        >
                          {editingId === user.id && (
                            <Chip 
                              label="Editing" 
                              color="primary" 
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: -10,
                                right: 16,
                                zIndex: 1
                              }}
                            />
                          )}
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-start' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: getAvatarColor(user.name),
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                    mr: 2
                                  }}
                                >
                                  {getInitials(user.name)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {user.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      mt: 0.5
                                    }}
                                  >
                                    <Mail fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEdit(user)}
                                    sx={{ mr: 0.5 }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for alerts */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={4000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;