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
  Button,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../api';

const WasteList = () => {
  const navigate = useNavigate();
  const [wasteEntries, setWasteEntries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWasteEntries = async () => {
    try {
      const response = await api.get('/api/waste/');
      setWasteEntries(response.data);
    } catch (err) {
      setError('Failed to fetch waste entries');
      console.error('Error fetching waste entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteEntries();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this waste entry?')) {
      try {
        await api.delete(`/api/waste/${id}/`);
        setWasteEntries(wasteEntries.filter((entry) => entry.id !== id));
      } catch (err) {
        setError('Failed to delete waste entry');
        console.error('Error deleting waste entry:', err);
      }
    }
  };

  const getDisposalMethodColor = (method) => {
    const colors = {
      Composting: 'success',
      Landfill: 'error',
      'Animal Feed': 'warning',
      Recycling: 'info',
      Other: 'default',
    };
    return colors[method] || 'default';
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Food Waste Entries
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/waste/new')}
          >
            New Waste Entry
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Food Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Disposal Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wasteEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.disposal_method}
                      color={getDisposalMethodColor(entry.disposal_method)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/waste/${entry.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {wasteEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No waste entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default WasteList; 