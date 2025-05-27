import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PasswordReset from './components/Auth/PasswordReset';
import Dashboard from './components/Dashboard/Dashboard';
import DonationForm from './components/Donations/DonationForm';
import DonationList from './components/Donations/DonationList';
import DonationEdit from './components/Donations/DonationEdit';
import WasteForm from './components/Waste/WasteForm';
import WasteList from './components/Waste/WasteList';
import WasteEdit from './components/Waste/WasteEdit';
import CenterList from './components/Centers/CenterList';
import CenterForm from './components/Centers/CenterForm';
import CenterDetail from './components/Centers/CenterDetail';
import Profile from './components/Profile/Profile';
import RequestList from './components/Requests/RequestList';
import RequestForm from './components/Requests/RequestForm';
import MapView from './components/Map/MapView';
import Reports from './components/Reports/Reports';
import ExpirationManager from './components/Expiration/ExpirationManager';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/password-reset/:uidb64/:token" element={<PasswordReset />} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            <Route path="/donations" element={<PrivateRoute><DonationList /></PrivateRoute>} />
            <Route path="/donations/new" element={<PrivateRoute><DonationForm /></PrivateRoute>} />
            <Route path="/donations/:id/edit" element={<PrivateRoute><DonationEdit /></PrivateRoute>} />
            
            <Route path="/waste" element={<PrivateRoute><WasteList /></PrivateRoute>} />
            <Route path="/waste/new" element={<PrivateRoute><WasteForm /></PrivateRoute>} />
            <Route path="/waste/:id/edit" element={<PrivateRoute><WasteEdit /></PrivateRoute>} />
            
            <Route path="/centers" element={<PrivateRoute><CenterList /></PrivateRoute>} />
            <Route path="/centers/new" element={<PrivateRoute><CenterForm /></PrivateRoute>} />
            <Route path="/centers/:id" element={<PrivateRoute><CenterDetail /></PrivateRoute>} />
            <Route path="/centers/:id/edit" element={<PrivateRoute><CenterForm /></PrivateRoute>} />
            
            <Route path="/requests" element={<PrivateRoute><RequestList /></PrivateRoute>} />
            <Route path="/requests/new" element={<PrivateRoute><RequestForm /></PrivateRoute>} />
            
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/map" element={<PrivateRoute><MapView /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/expiration" element={<PrivateRoute><ExpirationManager /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;