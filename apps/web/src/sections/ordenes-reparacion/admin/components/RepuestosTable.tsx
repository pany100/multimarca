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
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
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
      flex: 2,
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
      flex: 0.8,
      renderCell: (params) => params.row.stock?.label,
    },
    {
      field: "sector",
      headerName: "Sector",
      flex: 0.7,
      renderCell: (params) => params.row.stock?.sector || "-",
    },
    {
      field: "precioCompra",
      headerName: "P. Compra",
      flex: 0.8,
      renderCell: (params) => getFormattedPrice(params.row.precioCompra),
    },
    {
      field: "markup",
      headerName: "Margen",
      flex: 0.5,
      renderCell: (params) =>
        params.row.markup != null ? `${params.row.markup}%` : "-",
    },
    {
      field: "iva",
      headerName: "IVA Venta",
      flex: 0.6,
      renderCell: (params) =>
        params.row.iva != null ? `${params.row.iva}%` : "-",
    },
    {
      field: "unidadesConsumidas",
      headerName: "Uds.",
      flex: 0.4,
    },
    {
      field: "precioVenta",
      headerName: "P. Venta",
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {getFormattedPrice(params.row.precioVenta)}
        </Typography>
      ),
    },
    {
      field: "ocultoParaCliente",
      headerName: "Oculto",
      flex: 0.4,
      valueGetter: (value) => (value ? "Sí" : "No"),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
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
