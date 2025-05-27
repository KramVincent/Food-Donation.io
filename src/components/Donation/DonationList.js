import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const DonationList = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await api.get('donations/');
      setDonations(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'An error occurred while fetching donations'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/donations/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`donations/${id}/`);
        setDonations(donations.filter((donation) => donation.id !== id));
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            'An error occurred while deleting the donation'
        );
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Reserved':
        return 'warning';
      case 'Collected':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Food Donations
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/donations/new')}
          >
            New Donation
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {donations.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {donation.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Type: {donation.type}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Quantity: {donation.quantity}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Expires: {new Date(donation.expiration_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {donation.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={donation.status}
                      color={getStatusColor(donation.status)}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(donation.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(donation.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {donations.length === 0 && !loading && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No donations found
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default DonationList; 