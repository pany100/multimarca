import { getFormattedPrice } from "@/utils/fieldHelper";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

const TrabajosRealizadosTableColumns: GridColDef[] = [
  {
    field: "manoDeObra",
    headerName: "Trabajo",
    flex: 3,
    valueGetter: (value: { name: string }) => value?.name,
  },
  {
    field: "precioUnitario",
    headerName: "Precio",
    flex: 1,
    valueGetter: (value) => getFormattedPrice(value),
  },
  {
    field: "diasParaRecordatorio",
    headerName: "Recordatorio (días)",
    flex: 1,
    renderCell: (params) => {
      const { diasParaRecordatorio } = params.row.manoDeObra;
      if (!diasParaRecordatorio) {
        return (
          <Typography variant="body2" color="text.secondary">
            Sin recordatorio
          </Typography>
        );
      }
      return (
        <Box display="flex" alignItems="center">
          <EventNoteIcon
            fontSize="small"
            sx={{ mr: 0.5, color: "text.secondary" }}
          />
          {diasParaRecordatorio} días
        </Box>
      );
    },
  },
];

export default TrabajosRealizadosTableColumns;
