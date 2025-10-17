import DateRangeSearch from "@/components/dates/DateRangeSearch";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface TareasFiltersProps {
  onSearch: (searchQuery: string, fromDate: Date | null, toDate: Date | null, hasActiveFilters: boolean) => void;
  onClear: () => void;
  onReset: () => void;
}

const TareasFilters = ({ onSearch, onClear, onReset }: TareasFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Handler para búsqueda global
  const handleSearch = () => {
    const hasActiveFilters = !!(searchQuery.trim() || fromDate || toDate);
    onSearch(searchQuery, fromDate, toDate, hasActiveFilters);
  };

  // Handler para limpiar solo el texto de búsqueda (botón X)
  const handleClearSearchText = () => {
    setSearchQuery("");
    onClear();
  };

  // Handler para resetear todos los filtros (botón Resetear)
  const handleResetFilters = () => {
    setSearchQuery("");
    setFromDate(null);
    setToDate(null);
    onReset();
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = !!(searchQuery || fromDate || toDate);

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        {/* Campo de búsqueda por texto */}
        <TextField
          variant="outlined"
          placeholder="Buscar tareas por descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="limpiar búsqueda"
                  onClick={handleClearSearchText}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
        
        {/* Filtros de fecha */}
        <DateRangeSearch 
          key={`${fromDate?.getTime() || 'null'}-${toDate?.getTime() || 'null'}`}
          setFrom={setFromDate} 
          setTo={setToDate}
          fromValue={fromDate}
          toValue={toDate}
        />
        
        {/* Botón de búsqueda global */}
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Buscar
        </Button>
        
        {/* Botón para resetear filtros */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            startIcon={<ClearIcon />}
          >
            Resetear
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default TareasFilters;
