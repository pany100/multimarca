import { GridRowParams } from "@mui/x-data-grid";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function PrestamoHerramientasTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "nombre", headerName: "Nombre", flex: 1.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: any) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        return date.toLocaleDateString("es-AR");
      },
    },
    {
      field: "herramienta",
      headerName: "Herramienta",
      flex: 2,
    },
    {
      field: "devuelto",
      headerName: "Devuelto",
      flex: 0.8,
      renderCell: (params: any) => (params.value ? "Sí" : "No"),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    if (!params.row.devuelto) {
      return "low-stock-row";
    }
    return "";
  };

  return (
    <CustomTable
      title="Préstamos de Herramientas"
      columns={columns}
      apiEndpoint="/api/prestamo-herramientas"
      ctaCb={ctaCb}
      extraActions={extraActions}
      getRowClassName={getRowClassName}
      {...rest}
    />
  );
}

export default PrestamoHerramientasTable;
