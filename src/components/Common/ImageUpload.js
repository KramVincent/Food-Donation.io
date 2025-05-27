import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../api';

const ImageUpload = ({ onImageUpload, existingImage = null }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(existingImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await api.post('upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onImageUpload(response.data.url);
      setSelectedImage(null);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setPreview(null);
    onImageUpload(null);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageSelect}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Select Image
        </Button>
      </label>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {preview && (
        <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'cover',
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      {selectedImage && !preview && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload; 