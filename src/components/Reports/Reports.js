import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';
import api from '../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    wasteTrends: [],
    donationStats: [],
    wasteCategories: [],
    centerPerformance: [],
    environmentalImpact: null,
  });

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reports/?time_range=${timeRange}`);
      const data = response.data || {};

      // Format waste trends data
      const formattedWasteTrends = (data.wasteTrends || []).map(trend => ({
        ...trend,
        date: trend.date ? new Date(trend.date).toLocaleDateString() : 'Unknown Date',
        amount: Number(trend.amount) || 0
      }));

      // Format donation statistics
      const formattedDonationStats = (data.donationStats || []).map(stat => ({
        ...stat,
        category: stat.category || 'Other',
        amount: Number(stat.amount) || 0
      }));

      // Format waste categories
      const formattedWasteCategories = (data.wasteCategories || []).map(category => ({
        ...category,
        name: category.name || 'Other',
        value: Number(category.value) || 0
      }));

      // Format center performance
      const formattedCenterPerformance = (data.centerPerformance || []).map(center => ({
        ...center,
        name: center.name || 'Unknown Center',
        donations: Number(center.donations) || 0,
        waste: Number(center.waste) || 0
      }));

      // Format environmental impact
      const formattedEnvironmentalImpact = {
        co2Saved: Number(data.environmentalImpact?.co2_saved) || 0,
        waterSaved: Number(data.environmentalImpact?.water_saved) || 0,
        foodSaved: Number(data.environmentalImpact?.food_saved) || 0
      };

      setReportData({
        wasteTrends: formattedWasteTrends,
        donationStats: formattedDonationStats,
        wasteCategories: formattedWasteCategories,
        centerPerformance: formattedCenterPerformance,
        environmentalImpact: formattedEnvironmentalImpact
      });
      setError('');
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch report data. Please try again later.');
      // Set default empty data
      setReportData({
        wasteTrends: [],
        donationStats: [],
        wasteCategories: [],
        centerPerformance: [],
        environmentalImpact: {
          co2Saved: 0,
          waterSaved: 0,
          foodSaved: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/api/reports/export/${type}/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export report');
      console.error('Error exporting report:', err);
    }
  };

  // Custom tooltip formatter
  const formatTooltip = (value, name) => {
    try {
      const formattedValue = Number(value).toFixed(2);
      if (name === 'amount') return [`${formattedValue} kg`, 'Waste Amount'];
      if (name === 'donations') return [`${formattedValue} kg`, 'Donations'];
      if (name === 'waste') return [`${formattedValue} kg`, 'Waste'];
      return [formattedValue, name];
    } catch (err) {
      console.error('Error formatting tooltip:', err);
      return [value, name];
    }
  };

  // Custom label formatter for pie chart
  const formatPieLabel = ({ name, percent }) => {
    try {
      return `${name} (${(percent * 100).toFixed(0)}%)`;
    } catch (err) {
      console.error('Error formatting pie label:', err);
      return name;
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reports & Analytics
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Waste Trends */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Waste Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.wasteTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value} kg`}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    name="Waste Amount"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Donation Statistics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Donation Statistics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.donationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value} kg`}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    fill="#82ca9d" 
                    name="Donation Amount"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Waste Categories */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Waste Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.wasteCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={formatPieLabel}
                  >
                    {reportData.wasteCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kg`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Center Performance */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Center Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.centerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value} kg`}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Bar 
                    dataKey="donations" 
                    fill="#8884d8" 
                    name="Donations"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="waste" 
                    fill="#82ca9d" 
                    name="Waste"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Environmental Impact */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Environmental Impact
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {Number(reportData.environmentalImpact.co2Saved).toFixed(2)} kg
                    </Typography>
                    <Typography variant="subtitle1">CO2 Saved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {Number(reportData.environmentalImpact.waterSaved).toFixed(2)} L
                    </Typography>
                    <Typography variant="subtitle1">Water Saved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {Number(reportData.environmentalImpact.foodSaved).toFixed(2)} kg
                    </Typography>
                    <Typography variant="subtitle1">Food Saved</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Reports; 