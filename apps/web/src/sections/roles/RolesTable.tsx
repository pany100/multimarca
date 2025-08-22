import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function RolesTable({ extraActions, ctaCb, ...rest }: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Rol", flex: 1 },
    {
      field: "permisos",
      headerName: "Permisos",
      flex: 4,
      renderCell: (params: any) => {
        return (
          <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
            {params.row.permisos.join(", ")}
          </div>
        );
      },
    },
  ];
  return (
    <CustomTable
      title="Roles"
      columns={columns}
      apiEndpoint="/api/roles"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default RolesTable;
