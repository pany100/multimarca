import { getFormattedPrice } from "@/utils/fieldHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TrabajoRealizado {
  id: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number[] | null;
  pdfName?: string | null;
  iva?: number | null;
}

interface TrabajosTableProps {
  trabajos: TrabajoRealizado[];
  onEdit: (trabajo: TrabajoRealizado) => void;
  onDelete: (trabajo: TrabajoRealizado) => void;
  loading?: boolean;
}

const TrabajosTable = ({
  trabajos,
  onEdit,
  onDelete,
  loading = false,
}: TrabajosTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "descripcion",
      headerName: "Trabajo",
      flex: 3,
    },
    {
      field: "pdfName",
      headerName: "PDF",
      flex: 1,
      renderCell: (params) =>
        params.value?.trim() ? params.value : "-",
    },
    {
      field: "precioUnitario",
      headerName: "Precio Neto",
      flex: 1,
      valueGetter: (value) => getFormattedPrice(value),
    },
    {
      field: "iva",
      headerName: "IVA %",
      flex: 0.5,
      valueGetter: (value) => (value ? `${value}%` : "-"),
    },
    {
      field: "precioConIva",
      headerName: "Precio c/IVA",
      flex: 1,
      valueGetter: (_value, row) => {
        const precio = Number(row.precioUnitario) || 0;
        const iva = Number(row.iva) || 0;
        const precioFinal = iva > 0 ? Math.ceil(precio * (1 + iva / 100)) : precio;
        return getFormattedPrice(precioFinal);
      },
    },
    {
      field: "diasParaRecordatorio",
      headerName: "Recordatorio (días)",
      flex: 1,
      renderCell: (params) => {
        const dias = params.row.diasParaRecordatorio;
        const arr = Array.isArray(dias) ? dias : dias != null ? [dias] : null;
        if (!arr || arr.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              Sin recordatorio
            </Typography>
          );
        }
        const text =
          arr.length === 1
            ? `${arr[0]} días`
            : `${arr.sort((a, b) => a - b).join(", ")} días`;
        return (
          <Box display="flex" alignItems="center">
            <EventNoteIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            {text}
          </Box>
        );
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

  if (!trabajos || trabajos.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay trabajos realizados
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={trabajos}
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

export default TrabajosTable;
