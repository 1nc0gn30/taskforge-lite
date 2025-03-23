import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  Paper, 
  Chip, 
  Avatar, 
  IconButton, 
  Divider, 
  CircularProgress, 
  Alert, 
  Snackbar,
  InputAdornment,
  CardActions,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Badge
} from '@mui/material';
import { 
  Task as TaskIcon, 
  Person, 
  Description, 
  CalendarToday, 
  Add, 
  Edit, 
  Delete, 
  CheckCircle, 
  Refresh, 
  Search, 
  Assignment,
  FilterList,
  SortByAlpha
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const priorityColors = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  none: '#9e9e9e'
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    userId: '', 
    priority: 'medium',
    dueDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState({ tasks: true, users: true });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState({ user: 'all', priority: 'all', status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch tasks with better error handling
  const fetchTasks = async () => {
    setFetchLoading(prev => ({ ...prev, tasks: true }));
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      applyFiltersAndSort(res.data);
      showAlert('Tasks loaded successfully', 'success');
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      showAlert('Failed to load tasks. Please try again.', 'error');
    } finally {
      setFetchLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Fetch users with better error handling
  const fetchUsers = async () => {
    setFetchLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showAlert('Failed to load users. Please try again.', 'error');
    } finally {
      setFetchLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Apply filters and sort to tasks
  const applyFiltersAndSort = (taskList = tasks) => {
    let result = [...taskList];
    
    // Apply user filter
    if (filter.user !== 'all') {
      result = result.filter(task => task.userId === filter.user);
    }
    
    // Apply priority filter
    if (filter.priority !== 'all') {
      result = result.filter(task => task.priority === filter.priority);
    }
    
    // Apply status filter
    if (filter.status !== 'all') {
      result = result.filter(task => 
        filter.status === 'completed' ? task.completed : !task.completed
      );
    }
    
    // Apply search
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };
        result.sort((a, b) => priorityOrder[a.priority || 'none'] - priorityOrder[b.priority || 'none']);
        break;
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    setFilteredTasks(result);
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({ user: 'all', priority: 'all', status: 'all' });
    setSearchTerm('');
    setSortBy('newest');
    applyFiltersAndSort();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!form.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!form.userId) {
      errors.userId = 'Please assign this task to a user';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Create task
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const taskData = {
        ...form,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      await api.post('/tasks', taskData);
      setForm({ title: '', description: '', userId: '', priority: 'medium', dueDate: '' });
      showAlert('Task created successfully!', 'success');
      fetchTasks();
    } catch (err) {
      console.error('Task creation failed:', err);
      showAlert('Failed to create task. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const handleUpdate = async () => {
    if (!validateForm() || !editingId) return;
    
    setLoading(true);
    try {
      await api.put(`/tasks/${editingId}`, form);
      setForm({ title: '', description: '', userId: '', priority: 'medium', dueDate: '' });
      setEditingId(null);
      showAlert('Task updated successfully!', 'success');
      fetchTasks();
    } catch (err) {
      console.error('Task update failed:', err);
      showAlert('Failed to update task. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      showAlert('Task deleted successfully!', 'success');
      fetchTasks();
    } catch (err) {
      console.error('Task deletion failed:', err);
      showAlert('Failed to delete task. Please try again.', 'error');
    }
  };

  // Toggle task completion status
  const handleToggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { 
        ...task, 
        completed: !task.completed 
      });
      showAlert(`Task marked as ${!task.completed ? 'completed' : 'incomplete'}`, 'success');
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      showAlert('Failed to update task status. Please try again.', 'error');
    }
  };

  // Edit task setup
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      userId: task.userId,
      priority: task.priority || 'medium',
      dueDate: task.dueDate || ''
    });
    setEditingId(task.id);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setForm({ title: '', description: '', userId: '', priority: 'medium', dueDate: '' });
    setEditingId(null);
    setFormErrors({});
  };

  // Show alert helper
  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Effect for filters/sort
  useEffect(() => {
    if (tasks.length) {
      applyFiltersAndSort();
    }
  }, [filter, searchTerm, sortBy]);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if date is past due
  const isPastDue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <TaskIcon sx={{ mr: 1, color: 'primary.main' }} />
          Task Management
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {/* Task Form */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#f8faff',
              position: 'sticky',
              top: 20,
            }}
            component={motion.div}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Assignment sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                {editingId ? 'Edit Task' : 'Create New Task'}
              </Typography>
            </Box>
            
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 3 }}
              error={!!formErrors.title}
              helperText={formErrors.title}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TaskIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }} error={!!formErrors.userId}>
              <InputLabel id="user-select-label">Assign to User</InputLabel>
              <Select
                labelId="user-select-label"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                label="Assign to User"
                startAdornment={
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                }
              >
                {fetchLoading.users ? (
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading users...
                    </Box>
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.8rem', 
                            mr: 1,
                            bgcolor: user.name.charCodeAt(0) % 2 === 0 ? 'primary.light' : 'secondary.light'
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        {user.name}
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {formErrors.userId && <FormHelperText>{formErrors.userId}</FormHelperText>}
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="high">
                    <Chip 
                      size="small" 
                      label="High" 
                      sx={{ bgcolor: priorityColors.high, color: 'white' }}
                    />
                  </MenuItem>
                  <MenuItem value="medium">
                    <Chip 
                      size="small" 
                      label="Medium" 
                      sx={{ bgcolor: priorityColors.medium, color: 'white' }}
                    />
                  </MenuItem>
                  <MenuItem value="low">
                    <Chip 
                      size="small" 
                      label="Low" 
                      sx={{ bgcolor: priorityColors.low, color: 'white' }}
                    />
                  </MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : editingId ? <Edit /> : <Add />}
                sx={{ 
                  py: 1.2,
                  backgroundColor: editingId ? 'success.main' : 'primary.main',
                  '&:hover': {
                    backgroundColor: editingId ? 'success.dark' : 'primary.dark',
                  }
                }}
              >
                {loading ? 'Processing...' : editingId ? 'Update Task' : 'Create Task'}
              </Button>
              
              {editingId && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCancelEdit}
                  sx={{ py: 1.2 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Tasks List */}
        <Grid item xs={12} md={8}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2">Filters:</Typography>
                </Box>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={filter.user}
                    onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                    label="User"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filter.priority}
                    onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  placeholder="Search tasks..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                      startAdornment={
                        <InputAdornment position="start">
                          <SortByAlpha fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="newest">Newest</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="priority">Priority</MenuItem>
                      <MenuItem value="dueDate">Due Date</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Tooltip title="Refresh Tasks">
                    <IconButton 
                      color="primary" 
                      onClick={fetchTasks}
                      disabled={fetchLoading.tasks}
                    >
                      {fetchLoading.tasks ? 
                        <CircularProgress size={24} /> : 
                        <Refresh />
                      }
                    </IconButton>
                  </Tooltip>
                  
                  <Button 
                    size="small" 
                    onClick={resetFilters}
                    disabled={
                      filter.user === 'all' && 
                      filter.priority === 'all' && 
                      filter.status === 'all' && 
                      !searchTerm && 
                      sortBy === 'newest'
                    }
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            {/* Task Count */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                Tasks 
                <Chip 
                  label={filteredTasks.length} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
            
            {/* Tasks Grid */}
            {fetchLoading.tasks ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredTasks.length === 0 ? (
              <Paper
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5'
                }}
              >
                <TaskIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {tasks.length === 0 ? 
                    'No tasks found. Create your first task!' : 
                    'No tasks match your current filters'
                  }
                </Typography>
                {(tasks.length > 0 && filteredTasks.length === 0) && (
                  <Button 
                    variant="text" 
                    onClick={resetFilters}
                    sx={{ mt: 1 }}
                  >
                    Clear filters
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={2}>
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <Grid key={task.id} item xs={12} md={6} lg={6}>
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
                            borderLeft: '4px solid',
                            borderColor: task.priority ? priorityColors[task.priority] : priorityColors.none,
                            opacity: task.completed ? 0.8 : 1,
                            '&:hover': {
                              boxShadow: 6,
                              transform: 'translateY(-4px)',
                            },
                            position: 'relative',
                          }}
                        >
                          {task.completed && (
                            <Chip 
                              label="Completed" 
                              color="success" 
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: 10,
                                right: 10,
                              }}
                            />
                          )}
                          
                          {isPastDue(task.dueDate) && !task.completed && (
                            <Chip 
                              label="Overdue" 
                              color="error" 
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: 10,
                                right: 10,
                              }}
                            />
                          )}
                          
                          <CardContent>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'text.secondary' : 'text.primary',
                                mb: 1
                              }}
                            >
                              {task.title}
                            </Typography>
                            
                            {task.description && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                {task.description}
                              </Typography>
                            )}
                            
                            <Divider sx={{ my: 1.5 }} />
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              <Chip 
                                avatar={<Avatar>{getUserName(task.userId).charAt(0)}</Avatar>}
                                label={getUserName(task.userId)}
                                size="small"
                                variant="outlined"
                              />
                              
                              {task.priority && (
                                <Chip 
                                  label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  size="small"
                                  sx={{ 
                                    bgcolor: priorityColors[task.priority], 
                                    color: 'white' 
                                  }}
                                />
                              )}
                              
                              {task.dueDate && (
                                <Chip 
                                  icon={<CalendarToday fontSize="small" />}
                                  label={formatDate(task.dueDate)}
                                  size="small"
                                  variant="outlined"
                                  color={isPastDue(task.dueDate) && !task.completed ? "error" : "default"}
                                />
                              )}
                            </Box>
                          </CardContent>
                          
                          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                            <Tooltip title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}>
                              <IconButton 
                                color={task.completed ? "default" : "success"} 
                                onClick={() => handleToggleComplete(task)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEdit(task)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                color="error" 
                                onClick={() => handleDelete(task.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </CardActions>
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

export default Tasks;