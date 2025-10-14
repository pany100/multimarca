import { Box, Grid, Typography } from "@mui/material";
import { useEmpleadosContext } from "../context/EmpleadosContext";
import MecanicosImagenData from "./MecanicosImagenData";

function MecanicosDocumentacionData() {
  const { empleado } = useEmpleadosContext();

  const documentos = [
    {
      label: "Licencia de Conducir",
      filePath: empleado?.licenciaConducirPath,
    },
    {
      label: "Inscripción Monotributo",
      filePath: empleado?.inscripcionMonotributoPath,
    },
    {
      label: "Curriculum",
      filePath: empleado?.curriculumPath,
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
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  textAlign="center"
                >
                  {documento.label}
                </Typography>
                <MecanicosImagenData
                  filePath={documento.filePath || null}
                  alt={documento.label}
                  maxWidth={200}
                  maxHeight={200}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}

export default MecanicosDocumentacionData;
