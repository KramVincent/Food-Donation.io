import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const ExpirationManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/expiration/');
      setItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch expiration data');
      console.error('Error fetching expiration data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setExpirationDate(new Date(item.expiration_date));
    setDialogOpen(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/api/expiration/${itemId}/`);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/api/expiration/${selectedItem.id}/`, {
        expiration_date: expirationDate.toISOString().split('T')[0],
      });
      setItems(items.map(item =>
        item.id === selectedItem.id
          ? { ...item, expiration_date: expirationDate.toISOString().split('T')[0] }
          : item
      ));
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to update expiration date');
      console.error('Error updating expiration date:', err);
    }
  };

  const getExpirationStatus = (date) => {
    const today = new Date();
    const expirationDate = new Date(date);
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { label: 'Expired', color: 'error' };
    } else if (daysUntilExpiration <= 3) {
      return { label: 'Expiring Soon', color: 'warning' };
    } else {
      return { label: 'Good', color: 'success' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Food Expiration Manager
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Food Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Expiration Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const status = getExpirationStatus(item.expiration_date);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {new Date(item.expiration_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        icon={status.color === 'warning' ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Update Expiration Date</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedItem?.name}
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiration Date"
                  value={expirationDate}
                  onChange={(newValue) => setExpirationDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ExpirationManager; 