import { getFormattedPrice } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Link from "next/link";

interface ReparacionTercero {
  id: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor: {
    id: number;
    name: string;
  };
  recibo?: string | null;
}

interface TercerosTableProps {
  terceros: ReparacionTercero[];
  porcentajeRecargo?: number;
  onEdit: (tercero: ReparacionTercero) => void;
  onDelete: (tercero: ReparacionTercero) => void;
  loading?: boolean;
}

const TercerosTable = ({
  terceros,
  porcentajeRecargo = 0,
  onEdit,
  onDelete,
  loading = false,
}: TercerosTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 1,
      renderCell: (params) => params.row.proveedor?.name || "-",
    },
    {
      field: "precioCompra",
      headerName: "Precio Compra",
      width: 130,
      renderCell: (params) => getFormattedPrice(params.row.precioCompra),
    },
    {
      field: "precioVenta",
      headerName: "Precio Venta",
      width: 130,
      renderCell: (params) => getFormattedPrice(params.row.precioVenta),
    },
    {
      field: "precioConRecargo",
      headerName: `Precio con recargo (${porcentajeRecargo}%)`,
      flex: 1,
      valueFormatter: (value: number) => getFormattedPrice(value || 0),
    },
    {
      field: "recibo",
      headerName: "Recibo",
      flex: 1,
      renderCell: (params: any) => {
        const recibo = params.row.recibo;
        if (recibo) {
          return (
            <Link href={recibo} target="_blank">
              <Button size="small" color="primary" startIcon={<ReceiptIcon />}>
                Ver recibo
              </Button>
            </Link>
          );
        } else {
          return (
            <Typography variant="body2" color="text.secondary">
              Sin recibo
            </Typography>
          );
        }
      },
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

  if (!terceros || terceros.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay reparaciones de terceros
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={terceros}
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
        }}
        getRowHeight={() => "auto"}
      />
    </Box>
  );
};

export default TercerosTable;
