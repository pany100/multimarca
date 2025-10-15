"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface Props {
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function LicenciaForm({ methods, onSubmit, onCancel }: Props) {
  const { handleSubmit } = methods;
  const { vacacionEstadoOptions, siNo } = useFixedSelectData();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          {/* Formulario */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Datos de la Licencia
              </Typography>

              <Grid container spacing={3}>
                {/* Fecha Desde */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="fechaDesde"
                    label="Fecha Desde"
                    type="date"
                  />
                </Grid>

                {/* Fecha Hasta */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="fechaHasta"
                    label="Fecha Hasta"
                    type="date"
                  />
                </Grid>

                {/* Goce de Sueldo */}
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    options={siNo}
                    name="esGoceSueldo"
                    label="Goce de Sueldo"
                  />
                </Grid>

                {/* Estado */}
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    options={vacacionEstadoOptions}
                    name="estado"
                    label="Estado"
                  />
                </Grid>

                {/* Fecha Aprobación */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="fechaAprobacion"
                    label="Fecha Aprobación"
                    type="date"
                  />
                </Grid>

                {/* Observaciones */}
                <Grid item xs={12}>
                  <CustomInputText
                    name="observaciones"
                    label="Observaciones"
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
            Guardar Licencia
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default LicenciaForm;
