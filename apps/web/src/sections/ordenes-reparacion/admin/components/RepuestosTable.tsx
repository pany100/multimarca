import { getFormattedPrice } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface RepuestoUsado {
  id: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  ocultoParaCliente?: boolean;
  stock: {
    id: number;
    nombre: string;
  };
}

interface RepuestosTableProps {
  repuestos: RepuestoUsado[];
  onEdit: (repuesto: RepuestoUsado) => void;
  onDelete: (repuesto: RepuestoUsado) => void;
  loading?: boolean;
}

const RepuestosTable = ({
  repuestos,
  onEdit,
  onDelete,
  loading = false,
}: RepuestosTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "stock",
      headerName: "Repuesto",
      flex: 3,
      valueFormatter: (value: { name: string }) => value?.name,
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 1,
      renderCell: (params) => params.row.stock?.proveedor?.name,
    },
    {
      field: "label",
      headerName: "Rótulo",
      flex: 1,
      renderCell: (params) => params.row.stock?.label,
    },
    {
      field: "precioCompra",
      headerName: "Precio Compra",
      flex: 1,
      valueGetter: (value) => getFormattedPrice(value),
    },
    {
      field: "unidadesConsumidas",
      headerName: "Unidades Consumidas",
      flex: 1,
    },
    {
      field: "precioVenta",
      headerName: "Precio Final",
      flex: 1,
      valueFormatter: (value) => getFormattedPrice(value),
    },
    {
      field: "ocultoParaCliente",
      headerName: "Oculto",
      flex: 0.7,
      valueGetter: (value) => (value ? "Sí" : "No"),
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

  if (!repuestos || repuestos.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay repuestos usados
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={repuestos}
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
            whiteSpace: "normal",
            wordWrap: "break-word",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "none !important",
          },
          "& .oculto-row": {
            backgroundColor: "rgba(255, 215, 0, 0.15)",
          },
        }}
        getRowClassName={(params) =>
          params.row.ocultoParaCliente ? "oculto-row" : ""
        }
        getRowHeight={() => "auto"}
      />
    </Box>
  );
};

export default RepuestosTable;
