import { getFormattedDate } from "@/utils/fieldHelper";
import { Box, Button, CardContent, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AusenciaProgramada } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEmpleadosContext } from "../context/EmpleadosContext";

function MecanicosVacacionesData() {
  const { empleado, loading } = useEmpleadosContext();
  const router = useRouter();

  // Filter ausenciasProgramadas for vacations with esGoceSueldo = true and tipo = "Vacaciones"
  const vacaciones =
    empleado?.ausenciasProgramadas?.filter(
      (ausencia: AusenciaProgramada) =>
        ausencia.esGoceSueldo === true && ausencia.tipo === "Vacaciones"
    ) || [];

  const handleUpdate = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/agregar-vacaciones`);
    }
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fechaDesde",
      headerName: "Fecha Desde",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "fechaHasta",
      headerName: "Fecha Hasta",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fechaCreacion",
      headerName: "Fecha Creación",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "fechaAprobacion",
      headerName: "Fecha Aprobación",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
  ];

  const renderTableContent = () => {
    if (loading) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1">Cargando datos...</Typography>
        </Box>
      );
    }

    if (!vacaciones || vacaciones.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay vacaciones registradas
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={vacaciones}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
            padding: "8px",
          },
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      />
    );
  };

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5, mt: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Vacaciones
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderTableContent()}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleUpdate}
                disabled={!empleado?.id}
              >
                Agregar Vacaciones
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </>
  );
}

export default MecanicosVacacionesData;
