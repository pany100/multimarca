import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function FeriadosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) =>
        new Date(value).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
    },
  ];

  return (
    <CustomTable
      title="Feriados"
      apiEndpoint="/api/feriados"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default FeriadosTable;
