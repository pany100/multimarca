import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function TiposOperacionTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "label", headerName: "Nombre", flex: 2 },
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
