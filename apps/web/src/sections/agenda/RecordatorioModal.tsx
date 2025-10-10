import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputDate from "@/components/formV2/CustomInputDate";
import CustomInputText from "@/components/formV2/CustomInputText";
import FormModal from "@/components/formV2/FormModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  createAgendaSchema,
  CreateAgendaSchema,
} from "../../core/infrastructure/validation/schemas/agenda.schema";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";

function RecordatorioModal() {
  const { isModalOpen, setIsModalOpen, loading } = useAgendaUIContext();
  const { currentRecordatorio } = useCalendarContext();
  const methods = useForm<CreateAgendaSchema>({
    resolver: zodResolver(createAgendaSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = methods;

  useEffect(() => {
    if (currentRecordatorio) {
      reset({
        titulo: currentRecordatorio.titulo,
        descripcion: currentRecordatorio.descripcion || "",
        fecha: new Date(currentRecordatorio.fecha),
        hecho: currentRecordatorio.hecho,
      });
    } else {
      reset({
        titulo: "",
        descripcion: "",
        fecha: new Date(),
        hecho: false,
      });
    }
  }, [currentRecordatorio, reset]);

  const onSubmit = (data: CreateAgendaSchema) => {
    console.log(data);
  };

  return (
    <FormModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Información Del Recordatorio
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomInputText name="titulo" label="Título" />
            </Grid>
            <Grid item xs={12}>
              <CustomInputText
                name="descripcion"
                label="Descripción"
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomInputDate name="fecha" label="Fecha" />
            </Grid>
            <Grid item xs={6}>
              <CustomInputBoolean name="hecho" label="Hecho" />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Guardar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </FormModal>
  );
}

export default RecordatorioModal;
