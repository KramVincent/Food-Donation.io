import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import api from '../../api';

const defaultCenter = {
  lat: 14.5995, // Manila coordinates
  lng: 120.9842,
};

const MapView = () => {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await api.get('/api/centers/');
        setCenters(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch centers');
        console.error('Error fetching centers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

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
          Donation Centers Map
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <div style={{ height: '500px', width: '100%' }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${defaultCenter.lng - 0.1},${defaultCenter.lat - 0.1},${defaultCenter.lng + 0.1},${defaultCenter.lat + 0.1}&layer=mapnik&marker=${defaultCenter.lat},${defaultCenter.lng}`}
                  allowFullScreen
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '500px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Donation Centers
              </Typography>
              <List>
                {centers.map((center) => (
                  <React.Fragment key={center.id}>
                    <ListItem 
                      button 
                      onClick={() => setSelectedCenter(center)}
                      selected={selectedCenter?.id === center.id}
                    >
                      <ListItemText
                        primary={center.name}
                        secondary={center.address}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {selectedCenter && (
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedCenter.name}
            </Typography>
            <Typography variant="body1">
              Address: {selectedCenter.address}
            </Typography>
            <Typography variant="body1">
              Phone: {selectedCenter.phone}
            </Typography>
            <Typography variant="body1">
              Email: {selectedCenter.email}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MapView; 