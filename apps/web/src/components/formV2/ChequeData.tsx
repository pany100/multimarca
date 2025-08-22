import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import ChequeFields from "./ChequeFields";
import NumeroChequeField from "./NumeroChequeField";

function ChequeData() {
  const { setValue, watch } = useFormContext();
  const chequeId = watch("chequeId");

  const [nuevoFormVisible, setNuevoFormVisible] = useState(chequeId === null);

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean
  ) => {
    if (newValue !== null) {
      setNuevoFormVisible(newValue);
      if (newValue) {
        setValue("chequeId", null);
      }
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        ml: 2,
        mt: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#fafafa",
        width: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            fontWeight: "medium",
          }}
        >
          Datos del Cheque
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={nuevoFormVisible}
          onChange={handleToggleChange}
          aria-label="tipo de cheque"
          size="small"
          color="primary"
        >
          <ToggleButton value={false} aria-label="cheque existente">
            <SearchIcon sx={{ mr: 1 }} />
            Existente
          </ToggleButton>
          <ToggleButton value={true} aria-label="nuevo cheque">
            <AddIcon sx={{ mr: 1 }} />
            Nuevo
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <NumeroChequeField nuevoFormVisible={nuevoFormVisible} />
      <ChequeFields nuevoFormVisible={nuevoFormVisible} />
    </Paper>
  );
}

export default ChequeData;
