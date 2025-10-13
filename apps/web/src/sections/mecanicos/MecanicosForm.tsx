"use client";

import { Box, Button, Container, Paper } from "@mui/material";
import { FormProvider, UseFormReturn } from "react-hook-form";
import AddressSection from "./form/AdressSection";
import DatosLaboralesSection from "./form/DatosLaboralesSection";
import DocumentosSection from "./form/DocumentosSection";
import PersonalDataSection from "./form/PersonalDataSection";

type Props = {
  onSubmit: (data: any) => void;
  methods: UseFormReturn<any>;
  onCancel: () => void;
};

function MecanicosForm({ onSubmit, methods, onCancel }: Props) {
  const { handleSubmit, control } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          {/* Formulario */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <PersonalDataSection />

              <DatosLaboralesSection />

              <AddressSection />

              <DocumentosSection />
            </Paper>
          </Container>
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            p: 2,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            textAlign: "right",
          }}
        >
          <Button onClick={onCancel} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button variant="contained" type="submit">
            Guardar
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default MecanicosForm;
