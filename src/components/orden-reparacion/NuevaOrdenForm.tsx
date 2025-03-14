import schema from "@/sections/ordenes-reparacion/nueva/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import useNuevaOrden from "@/hooks/orden-reparacion/useNuevaOrden";
import { Alert, Box, Button, Link, Snackbar } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import AutoFormSection from "./form/commons/AutoFormSection";
import ClientObservationSection from "./form/commons/ClientObservationSection";
import InputObservationsSection from "./form/commons/InputObservationsSection";
import MecanicosSection from "./form/commons/MecanicosSection";
import PriceSection from "./form/commons/PriceSection";
import ReparacionesSection from "./form/commons/ReparacionesSection";
import RepuestosUsadosSection from "./form/commons/RepuestosUsadosSection";
import TrabajosSection from "./form/commons/TrabajosSection";

function NuevaOrdenForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit, control } = methods;

  const { onSubmit, snackbar, setSnackbar } = useNuevaOrden({ control });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AutoFormSection />
        <ClientObservationSection />
        <InputObservationsSection />
        <MecanicosSection />
        <RepuestosUsadosSection />
        <ReparacionesSection />
        <TrabajosSection />
        <PriceSection />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/dashboard/ordenes-reparacion"
          >
            Volver a la lista
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            sx={{
              px: 4,
              py: 1,
            }}
          >
            Crear Orden de Reparación
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity as "success" | "error"}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}

export default NuevaOrdenForm;
