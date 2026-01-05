import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TareaAdministrativa {
  id: number;
  descripcion: string;
  usuario: {
    id: number;
    fullName: string;
  };
}

interface TareasAdministrativasTableProps {
  tareas: TareaAdministrativa[];
  onEdit: (tarea: TareaAdministrativa) => void;
  onDelete: (tarea: TareaAdministrativa) => void;
  loading?: boolean;
}

const TareasAdministrativasTable = ({
  tareas,
  onEdit,
  onDelete,
  loading = false,
}: TareasAdministrativasTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "usuario",
      headerName: "Usuario Asignado",
      flex: 1,
      renderCell: (params) => params.row.usuario.fullName,
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
      renderCell: (params) => params.row.descripcion || "-",
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

  if (!tareas || tareas.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No hay tareas administrativas asignadas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={tareas}
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

export default TareasAdministrativasTable;
