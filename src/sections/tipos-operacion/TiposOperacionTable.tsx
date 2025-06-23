import { GridColDef } from "@mui/x-data-grid";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function TiposOperacionTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "label", headerName: "Nombre", flex: 2 },
    {
      field: "esIngreso",
      headerName: "Es Ingreso",
      flex: 0.5,
      type: "boolean",
    },
    { field: "esGasto", headerName: "Es Gasto", flex: 0.5, type: "boolean" },
  ];
  return (
    <CustomTable
      title="Tipos de Operación"
      columns={columns}
      apiEndpoint="/api/tipo-operacion"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default TiposOperacionTable;
