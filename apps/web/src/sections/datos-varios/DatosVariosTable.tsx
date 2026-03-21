import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function DatosVariosTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "titulo", headerName: "Título", flex: 2 },
    {
      field: "texto",
      headerName: "Texto",
      flex: 3,
      renderCell: (params: { value?: string }) => {
        const texto = params.value || "";
        return texto.length > 100 ? `${texto.substring(0, 100)}...` : texto;
      },
    },
  ];

  return (
    <CustomTable
      title="Datos varios"
      columns={columns}
      apiEndpoint="/api/datos-varios"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default DatosVariosTable;
