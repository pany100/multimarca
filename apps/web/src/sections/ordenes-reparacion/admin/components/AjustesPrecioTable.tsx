import { getFormattedPrice } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AjustePrecio } from "../hooks/useAjustesPrecioManager";

interface AjustesPrecioTableProps {
  ajustes: AjustePrecio[];
  onEdit: (ajuste: AjustePrecio) => void;
  onDelete: (ajuste: AjustePrecio) => void;
  loading?: boolean;
}

const AjustesPrecioTable = ({
  ajustes,
  onEdit,
  onDelete,
  loading = false,
}: AjustesPrecioTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "descripcion",
      headerName: "Descripcion",
      flex: 2,
    },
    {
      field: "esDescuento",
      headerName: "Efecto",
      width: 120,
      renderCell: (params) =>
        params.row.esDescuento ? "Descuento" : "Incremento",
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 130,
      renderCell: (params) => {
        if (params.row.tipo === "porcentual") return `${Number(params.row.monto)}%`;
        return getFormattedPrice(params.row.monto);
      },
    },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 110,
      renderCell: (params) =>
        params.row.tipo === "porcentual" ? "Porcentual" : "Fijo",
    },
    {
      field: "esInterno",
      headerName: "Oculto",
      width: 80,
      renderCell: (params) => (params.row.esInterno ? "Sí" : "No"),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(params.row)}
            disabled={loading}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(params.row)}
            disabled={loading}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ajustes || ajustes.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay ajustes de precio configurados
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={ajustes}
        columns={columns}
        disableRowSelectionOnClick
        hideFooter
        sx={{
          border: 1,
          borderColor: "divider",
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "primary.light",
            color: "white",
            fontSize: "0.875rem",
            fontWeight: 600,
          },
          "& .MuiDataGrid-filler": {
            backgroundColor: "primary.light",
          },
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
        getRowHeight={() => "auto"}
      />
    </Box>
  );
};

export default AjustesPrecioTable;
