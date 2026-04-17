import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { IconButton, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

function DocumentacionGeneralTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "titulo", headerName: "Título", flex: 2 },
    {
      field: "archivo",
      headerName: "Archivo",
      flex: 1,
      renderCell: (params) => {
        const archivo = params.value;
        if (!archivo) return "Sin archivo";
        const url = archivo.finalPath ?? archivo.tempPath;
        if (!url) return "Sin archivo";
        return (
          <Tooltip title="Abrir archivo">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(url, "_blank");
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      flex: 1,
      renderCell: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString("es-AR");
      },
    },
  ];

  return (
    <CustomTable
      title="Documentación General"
      columns={columns}
      apiEndpoint="/api/documentos-generales"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default DocumentacionGeneralTable;
