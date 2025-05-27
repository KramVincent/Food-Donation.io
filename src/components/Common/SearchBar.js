import React from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({
  searchQuery,
  onSearchChange,
  filters = {},
  onFilterChange,
  placeholder = 'Search...',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      {Object.entries(filters).map(([key, filter]) => (
        <FormControl key={key} sx={{ minWidth: 120 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={filter.value}
            label={filter.label}
            onChange={(e) => onFilterChange(key, e.target.value)}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  );
};

export default SearchBar; 