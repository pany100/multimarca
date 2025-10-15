"use client";

import CustomFileInput from "@/components/formV2/CustomFileInput";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useFixedSelectData from "@/hooks/useFixedSelectData";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface Props {
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function LlegadaTardeForm({
  methods,
  onSubmit,
  onCancel,
  isEdit = false,
}: Props) {
  const { handleSubmit } = methods;
  const { estadoLlegadaOptions } = useFixedSelectData();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          {/* Formulario */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {isEdit ? "Editar Llegada Tarde" : "Datos de la Llegada Tarde"}
              </Typography>

              <Grid container spacing={3}>
                {/* Fecha */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="fecha" label="Fecha" type="date" />
                </Grid>

                {/* Minutos Retraso */}
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="minutosRetraso"
                    label="Minutos de Retraso"
                    type="number"
                  />
                </Grid>

                {/* Estado */}
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    options={estadoLlegadaOptions}
                    name="estado"
                    label="Estado"
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

                {/* Certificado */}
                <Grid item xs={12}>
                  <CustomFileInput
                    name="certificadoPath"
                    label="Certificado (opcional)"
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
            {isEdit ? "Actualizar Llegada Tarde" : "Guardar Llegada Tarde"}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default LlegadaTardeForm;
