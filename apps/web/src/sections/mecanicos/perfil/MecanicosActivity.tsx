import WeekPicker from "@/sections/gastos/WeekPicker";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEmpleadosContext } from "../context/EmpleadosContext";

function MecanicosActivity() {
  const { reparaciones, loadingReparaciones, setDateRange } =
    useEmpleadosContext();
  const router = useRouter();

  const handleWeekChange = (week: { start: Date; end: Date }) => {
    setDateRange({
      from: week.start,
      to: week.end,
    });
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
      field: "estado",
      headerName: "Estado",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fechaSalidaReparacion",
      headerName: "Fecha Salida",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        if (!value) return "-";
        return getFormattedDate(value as string);
      },
    },
    {
      field: "patent",
      headerName: "Patente",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.auto?.patent || "-",
    },
    {
      field: "totalAPagar",
      headerName: "Total a Pagar",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => getFormattedPrice(value as string),
    },
    {
      field: "totalManoDeObra",
      headerName: "Total Mano de Obra",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => getFormattedPrice(value as string),
    },
  ];

  const handleRowClick = (params: any) => {
    router.push(`/dashboard/ordenes-reparacion/${params.row.id}/ver`);
  };

  const renderTableContent = () => {
    if (loadingReparaciones) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1">Cargando datos...</Typography>
        </Box>
      );
    }

    if (!reparaciones || reparaciones.length === 0) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay reparaciones en este período
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={reparaciones}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        autoHeight
        onRowClick={handleRowClick}
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
            padding: "8px",
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
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
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 1.5,
          pt: 0,
          pb: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Actividad reciente
        </Typography>
        <Box
          sx={{
            "& .MuiTextField-root": {
              "& input": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
            },
            "& .MuiSvgIcon-root": { color: "white" },
            mt: 2,
          }}
        >
          <WeekPicker onWeekChange={handleWeekChange} />
        </Box>
      </Box>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Box sx={{ mt: 3 }}>{renderTableContent()}</Box>
      </Box>
    </>
  );
}

export default MecanicosActivity;
