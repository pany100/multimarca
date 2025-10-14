import CustomImageInput from "@/components/formV2/CustomImageInput";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import useEmpleadoPersistence from "../hooks/useEmpleadoPersistence";

const schema = yup.object({
  licenciaConducirPath: yup.string().nullable(),
  inscripcionMonotributoPath: yup.string().nullable(),
  curriculumPath: yup.string().nullable(),
});

interface ActualizarDocumentacionFormProps {
  empleadoId: string;
}

function ActualizarDocumentacionForm({
  empleadoId,
}: ActualizarDocumentacionFormProps) {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const { empleado, loading } = useEmpleadosContext();
  const { updateEmpleadoDocs } = useEmpleadoPersistence();
  const { setSnackbar } = useSnackbarContext();

  const handleCancel = () => {
    router.push(`/dashboard/mecanicos/${empleadoId}/ver`);
  };

  const onSubmit = async (data: any) => {
    try {
      await updateEmpleadoDocs(data);
      router.push("/dashboard/mecanicos");
    } catch (error) {
      setSnackbar({
        message: "Error al actualizar el mecanico: " + error,
        severity: "error",
        open: true,
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando datos del empleado...
        </Typography>
      </Container>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Box>
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Documentación de {empleado?.name}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <CustomImageInput
                    name="licenciaConducirPath"
                    label="Licencia de Conducir"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <CustomImageInput
                    name="inscripcionMonotributoPath"
                    label="Inscripción Monotributo"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <CustomImageInput name="curriculumPath" label="Curriculum" />
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
          <Button onClick={handleCancel} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button variant="contained" type="submit">
            Guardar Cambios
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default ActualizarDocumentacionForm;
