import useChequesAutocomplete from "@/hooks/useChequesAutocomplete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Fade,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import ImageInput from "../ImageInput";
import CustomAutocompleteInput from "./CustomAutocomplete";
import CustomInputText from "./CustomInputText";

function ChequeData() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const picturePath = watch("picturePath");
  const { searchCheques, initialCheque } = useChequesAutocomplete();
  const [nuevoFormVisible, setNuevoFormVisible] = useState(false);

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean
  ) => {
    if (newValue !== null) {
      setNuevoFormVisible(newValue);
      // Clear the chequeId field when switching to new cheque form
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

      <Fade
        in={!nuevoFormVisible}
        timeout={500}
        unmountOnExit
        style={{ display: nuevoFormVisible ? "none" : "block" }}
      >
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomAutocompleteInput
                name="chequeId"
                label="Nro de cheque"
                searchOptions={searchCheques}
                initialOptions={initialCheque}
              />
            </Grid>
          </Grid>
        </div>
      </Fade>

      <Fade
        in={nuevoFormVisible}
        timeout={500}
        unmountOnExit
        style={{ display: !nuevoFormVisible ? "none" : "block" }}
      >
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="fechaEmision"
                label="Fecha emisión"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="fechaCobro"
                label="Fecha cobro"
                type="date"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText
                name="numeroCheque"
                label="Número de Cheque"
                type="text"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText name="banco" label="Banco" type="text" />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText name="importe" label="Importe" type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomInputText name="emisor" label="Emisor" type="text" />
            </Grid>
            <Grid item xs={12} md={12}>
              <ImageInput
                label="Foto"
                image={picturePath || ""}
                setImage={(e) => setValue("picturePath", e)}
              />
              {errors.picturePath && (
                <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
                  {errors.picturePath.message as string}
                </Typography>
              )}
            </Grid>
          </Grid>
        </div>
      </Fade>
    </Paper>
  );
}

export default ChequeData;
