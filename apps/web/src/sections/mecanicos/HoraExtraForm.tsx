"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface Props {
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function HoraExtraForm({
  methods,
  onSubmit,
  onCancel,
  isEdit = false,
}: Props) {
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          {/* Formulario */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {isEdit ? "Editar Hora Extra" : "Datos de la Hora Extra"}
              </Typography>

              <Grid container spacing={3}>
                {/* Fecha */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="fecha" label="Fecha" type="date" />
                </Grid>

                {/* Horas Totales */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="horasTotales"
                    label="Horas Totales"
                    type="number"
                    inputProps={{
                      step: "0.5",
                      min: "0",
                    }}
                  />
                </Grid>

                {/* Motivo */}
                <Grid item xs={12}>
                  <CustomInputText
                    name="motivo"
                    label="Motivo"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
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
            {isEdit ? "Actualizar Hora Extra" : "Guardar Hora Extra"}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default HoraExtraForm;
