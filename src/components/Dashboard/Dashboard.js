import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  LocalDining as FoodIcon,
  Delete as WasteIcon,
  Business as CenterIcon,
  People as UserIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalWaste: 0,
    totalCenters: 0,
    totalUsers: 0,
    donationsByType: [],
    wasteByReason: [],
    recentDonations: [],
    recentWaste: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [donationsRes, wasteRes, centersRes, usersRes] = await Promise.allSettled([
        api.get('/api/donations/'),
        api.get('/api/waste/'),
        api.get('/api/centers/'),
        api.get('/api/users/')
      ]);

      // Process donations data
      const donations = donationsRes.status === 'fulfilled' ? donationsRes.value.data : [];
      const donationsByType = donations.reduce((acc, donation) => {
        const type = donation.type || 'Other';
        acc[type] = (acc[type] || 0) + parseFloat(donation.quantity || 0);
        return acc;
      }, {});

      // Process waste data
      const waste = wasteRes.status === 'fulfilled' ? wasteRes.value.data : [];
      const wasteByReason = waste.reduce((acc, item) => {
        const reason = item.reason || 'Other';
        acc[reason] = (acc[reason] || 0) + parseFloat(item.quantity || 0);
        return acc;
      }, {});

      // Process centers data
      const centers = centersRes.status === 'fulfilled' ? centersRes.value.data : [];

      // Process users data
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];

      // Convert objects to arrays for charts
      const donationsByTypeArray = Object.entries(donationsByType).map(([type, count]) => ({
        type,
        count
      }));

      const wasteByReasonArray = Object.entries(wasteByReason).map(([reason, count]) => ({
        reason,
        count
      }));

      setStats({
        totalDonations: donations.length,
        totalWaste: waste.length,
        totalCenters: centers.length,
        totalUsers: users.length,
        donationsByType: donationsByTypeArray,
        wasteByReason: wasteByReasonArray,
        recentDonations: donations.slice(0, 5),
        recentWaste: waste.slice(0, 5),
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
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
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FoodIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Donations
                    </Typography>
                    <Typography variant="h4">{stats.totalDonations}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <WasteIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Waste
                    </Typography>
                    <Typography variant="h4">{stats.totalWaste}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CenterIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Donation Centers
                    </Typography>
                    <Typography variant="h4">{stats.totalCenters}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <UserIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Donations by Type
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.donationsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Waste by Reason
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.wasteByReason}
                      dataKey="count"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.wasteByReason.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Donations
              </Typography>
              {stats.recentDonations.map((donation) => (
                <Box key={donation.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{donation.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Type: {donation.type || 'Other'} | Quantity: {parseFloat(donation.quantity || 0).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Waste
              </Typography>
              {stats.recentWaste.map((waste) => (
                <Box key={waste.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{waste.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Reason: {waste.reason || 'Other'} | Quantity: {parseFloat(waste.quantity || 0).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 