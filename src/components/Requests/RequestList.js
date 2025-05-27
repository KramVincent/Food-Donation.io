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
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const RequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await api.get('requests/');
      setRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch donation requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleView = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedRequest(null);
    setResponseMessage('');
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.patch(`requests/${requestId}/`, {
        status: newStatus,
        message: responseMessage,
      });
      fetchRequests();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${newStatus.toLowerCase()} request`);
      console.error('Error updating request:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'warning',
      Approved: 'success',
      Rejected: 'error',
      Completed: 'info',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Donation Requests
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
                <TableCell>Donation</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.donation.name}</TableCell>
                  <TableCell>{request.donation_center.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleView(request)}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={viewDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          {selectedRequest && (
            <>
              <DialogTitle>Request Details</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Donation: {selectedRequest.donation.name}</Typography>
                  <Typography variant="subtitle1">Center: {selectedRequest.donation_center.name}</Typography>
                  <Typography variant="subtitle1">Status: {selectedRequest.status}</Typography>
                  <Typography variant="subtitle1">Message: {selectedRequest.message}</Typography>
                  
                  {selectedRequest.status === 'Pending' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Response Message"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                {selectedRequest.status === 'Pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'Approved')}
                      color="success"
                      startIcon={<ApproveIcon />}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'Rejected')}
                      color="error"
                      startIcon={<RejectIcon />}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default RequestList; 