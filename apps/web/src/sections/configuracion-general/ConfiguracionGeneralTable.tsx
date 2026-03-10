import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ConfiguracionGeneralTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "nombre", headerName: "Nombre", flex: 1.5 },
    {
      field: "valor",
      headerName: "Valor",
      flex: 2,
      renderCell: (params: any) => {
        const valor = params.value ?? "";
        const str = String(valor);
        return str.length > 80 ? `${str.substring(0, 80)}…` : str;
      },
    },
  ];

  return (
    <CustomTable
      title="Configuración General"
      columns={columns}
      apiEndpoint="/api/configuracion-general"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default ConfiguracionGeneralTable;
