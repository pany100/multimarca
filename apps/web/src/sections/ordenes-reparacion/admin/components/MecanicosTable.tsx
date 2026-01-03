import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Mecanico {
  id: number;
  name: string;
  detalle?: string | null;
  mecanicoOrdenRepId: number;
}

interface MecanicosTableProps {
  mecanicos: Mecanico[];
  onEdit: (mecanico: Mecanico) => void;
  onDelete: (mecanico: Mecanico) => void;
  loading?: boolean;
}

const MecanicosTable = ({
  mecanicos,
  onEdit,
  onDelete,
  loading = false,
}: MecanicosTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Mecánico",
      flex: 1,
    },
    {
      field: "detalle",
      headerName: "Detalle",
      flex: 2,
      renderCell: (params) => params.row.detalle || "-",
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

  if (!mecanicos || mecanicos.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay mecánicos asignados
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={mecanicos}
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
      />
    </Box>
  );
};

export default MecanicosTable;
