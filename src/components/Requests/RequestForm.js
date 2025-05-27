import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import api from '../../api';

const RequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    donation: '',
    donation_center: '',
    message: '',
  });
  const [donations, setDonations] = useState([]);
  const [centers, setCenters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [donationsResponse, centersResponse] = await Promise.all([
          api.get('donations/'),
          api.get('centers/'),
        ]);
        setDonations(donationsResponse.data.filter(d => d.status === 'Available'));
        setCenters(centersResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch required data');
        console.error('Error fetching data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('requests/', formData);
      navigate('/requests');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          Object.values(err.response?.data || {}).join(', ') ||
          'An error occurred while creating the request'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Donation Request
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Donation"
                  name="donation"
                  value={formData.donation}
                  onChange={handleChange}
                  required
                >
                  {donations.map((donation) => (
                    <MenuItem key={donation.id} value={donation.id}>
                      {donation.name} - {donation.type} ({donation.quantity})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Donation Center"
                  name="donation_center"
                  value={formData.donation_center}
                  onChange={handleChange}
                  required
                >
                  {centers.map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.name} - {center.address}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  helperText="Please provide details about your request"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/requests')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RequestForm; 