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
  Avatar, 
  Divider, 
  Paper, 
  Container, 
  CircularProgress,
  IconButton
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const CommentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    text: '',
    taskId: '',
    userId: ''
  });

  const fetchComments = async () => {
    if (!form.taskId) return;
    try {
      setLoading(true);
      const res = await api.get(`/comments/${form.taskId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      
      // If tasks are loaded and we don't have a task selected, select the first one
      if (res.data.length > 0 && !form.taskId) {
        setForm(prev => ({ ...prev, taskId: res.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      
      // If users are loaded and we don't have a user selected, select the first one
      if (res.data.length > 0 && !form.userId) {
        setForm(prev => ({ ...prev, userId: res.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async () => {
    if (!form.taskId || !form.userId || !form.text.trim()) return;
    
    try {
      setSubmitting(true);
      await api.post('/comments', form);
      setForm({ ...form, text: '' });
      fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (form.taskId) {
      fetchComments();
    }
  }, [form.taskId]);

  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || { name: 'Unknown User' };
  };

  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId) || { title: 'Unknown Task' };
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Comments
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select Task"
              value={form.taskId}
              onChange={(e) => setForm({ ...form, taskId: e.target.value })}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Comment As"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        <Box sx={{ position: 'relative', mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Write a comment"
            placeholder="Type your comment here..."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button 
              variant="text" 
              onClick={fetchComments}
              startIcon={<RefreshIcon />}
              disabled={loading || !form.taskId}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleCreate}
              disabled={submitting || !form.taskId || !form.userId || !form.text.trim()}
            >
              Add Comment
            </Button>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {form.taskId ? 
          `Comments for ${getTaskById(form.taskId).title}` : 
          "Select a task to view comments"}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length > 0 ? (
        comments.map((comment) => {
          const user = getUserById(comment.userId);
          return (
            <CommentCard key={comment.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar 
                    sx={{ mr: 2, bgcolor: 'primary.main' }}
                  >
                    {user.name?.charAt(0) || '?'}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {comment.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Task: {getTaskById(comment.taskId).title} | 
                      {comment.createdAt && ` Posted: ${new Date(comment.createdAt).toLocaleString()}`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CommentCard>
          );
        })
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="body1" color="text.secondary">
            {form.taskId ? "No comments yet. Be the first to comment!" : "Select a task to view comments."}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Comments;