import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchInput = ({ 
  onSearch, 
  onClear, 
  placeholder = "Buscar tareas..." 
}: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchClick = () => {
    onSearch(searchValue.trim());
  };

  const handleClear = () => {
    setSearchValue("");
    onClear();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="limpiar búsqueda"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchClick}
          startIcon={<SearchIcon />}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          Buscar
        </Button>
      </Box>
    </Box>
  );
};

export default SearchInput;
