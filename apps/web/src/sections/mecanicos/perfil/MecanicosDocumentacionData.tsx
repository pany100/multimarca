import { Box, Button, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import MecanicosFileData from "./MecanicosFileData";

function MecanicosDocumentacionData() {
  const { empleado } = useEmpleadosContext();
  const router = useRouter();

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(
        `/dashboard/mecanicos/${empleado.id}/actualizar-documentacion`,
      );
    }
  };
  const documentos = [
    {
      label: "DNI - Frente",
      filePath: empleado?.dniFrentePath ?? null,
    },
    {
      label: "DNI - Dorso",
      filePath: empleado?.dniDorsoPath ?? null,
    },
    {
      label: "Licencia de Conducir - Frente",
      filePath: empleado?.licenciaConducirPath ?? null,
    },
    {
      label: "Licencia de Conducir - Dorso",
      filePath: empleado?.licenciaDorsoPath ?? null,
    },
    {
      label: "Recategorización Monotributo",
      filePath: empleado?.recategorizacionMonotributoPath ?? null,
    },
    {
      label: "Inscripción Monotributo",
      filePath: empleado?.inscripcionMonotributoPath ?? null,
    },
    {
      label: "Curriculum",
      filePath: empleado?.curriculumPath ?? null,
    },
    {
      label: "Credencial de Pago",
      filePath: empleado?.credencialPagoPath ?? null,
    },
  ];

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Documentación
        </Typography>
      </Box>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Grid container spacing={3}>
          {documentos.map((documento, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  height: 350, // Fixed height for all cards
                  justifyContent: "space-between", // Distribute space evenly
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ minHeight: 40, display: "flex", alignItems: "center" }} // Fixed height for title
                >
                  {documento.label}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MecanicosFileData
                    filePath={documento.filePath || null}
                    alt={documento.label}
                    maxWidth={250}
                    maxHeight={250}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleUpdate}
                disabled={!empleado?.id}
              >
                Actualizar Documentación
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default MecanicosDocumentacionData;
