import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../../api';

const CenterDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenterData = async () => {
      try {
        const [centerResponse, donationsResponse] = await Promise.all([
          api.get(`centers/${id}/`),
          api.get(`centers/${id}/donations/`),
        ]);
        setCenter(centerResponse.data);
        setDonations(donationsResponse.data);
      } catch (err) {
        setError('Failed to fetch center details');
      } finally {
        setLoading(false);
      }
    };

    fetchCenterData();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!center) {
    return (
      <Container>
        <Alert severity="error">Center not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/centers')}
            sx={{ mr: 2 }}
          >
            Back to Centers
          </Button>
          <Typography variant="h4" component="h1">
            {center.name}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Center Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={center.address}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={center.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={center.email}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {center.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={center.is_active ? 'Active' : 'Inactive'}
                  color={center.is_active ? 'success' : 'default'}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Recent Donations
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/centers/${id}/edit`)}
                >
                  Edit Center
                </Button>
              </Box>
              {donations.length > 0 ? (
                <List>
                  {donations.map((donation) => (
                    <React.Fragment key={donation.id}>
                      <ListItem>
                        <ListItemText
                          primary={donation.name}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {donation.type}
                              </Typography>
                              {` — Quantity: ${donation.quantity}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center">
                  No donations found for this center
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CenterDetail; 