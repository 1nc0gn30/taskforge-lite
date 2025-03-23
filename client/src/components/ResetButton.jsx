import { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const ResetButton = () => {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleReset = async () => {
    setLoading(true);
    handleCloseDialog();
    
    try {
      const res = await api.delete('/reset');
      setSnackbar({
        open: true,
        message: 'All data has been reset successfully',
        severity: 'success'
      });
      console.log(res.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Reset failed: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Main Button */}
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleOpenDialog}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        sx={{ 
          minWidth: '160px',
          borderRadius: '4px',
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }
        }}
      >
        {loading ? 'Resetting...' : 'Reset All Data'}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          Confirm Data Reset
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText id="reset-dialog-description">
            <Typography paragraph>
              <strong>Warning:</strong> You are about to reset all data. This action cannot be undone.
            </Typography>
            <Typography>
              Are you sure you want to proceed?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleReset} 
            color="error" 
            variant="contained" 
            autoFocus
            startIcon={<DeleteIcon />}
          >
            Reset Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetButton;