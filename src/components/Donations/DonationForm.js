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

const DonationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: '',
    expiration_date: '',
    description: '',
    donation_center: '',
  });
  const [centers, setCenters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(true);

  const foodTypes = [
    'Fruit',
    'Vegetable',
    'Meat',
    'Dairy',
    'Bakery',
    'Canned',
    'Other',
  ];

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoadingCenters(true);
        const response = await api.get('/api/centers/');
        console.log('Fetched centers:', response.data);
        setCenters(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching centers:', err);
        setError('Failed to fetch centers');
      } finally {
        setLoadingCenters(false);
      }
    };

    fetchCenters();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity),
      };
      await api.post('/api/donations/', data);
      navigate('/donations');
    } catch (err) {
      setError('Failed to create donation');
      console.error('Error creating donation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Submit Food Donation
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Food Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  {foodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0.1, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiration Date"
                  name="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Donation Center"
                  name="donation_center"
                  value={formData.donation_center}
                  onChange={handleChange}
                  required
                  disabled={loadingCenters}
                  helperText={loadingCenters ? "Loading centers..." : ""}
                >
                  {loadingCenters ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading centers...
                    </MenuItem>
                  ) : centers.length === 0 ? (
                    <MenuItem disabled>No centers available</MenuItem>
                  ) : (
                    centers.map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/donations')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading || loadingCenters}
                  >
                    {loading ? 'Submitting...' : 'Submit Donation'}
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

export default DonationForm; 