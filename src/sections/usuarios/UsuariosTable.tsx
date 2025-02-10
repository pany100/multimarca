import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function UsuariosTable({ extraActions, ctaCb, ...rest }: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullName", headerName: "Nombre completo", flex: 2 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "username", headerName: "Usuario", flex: 1.5 },
    { field: "rol", headerName: "Rol", flex: 1.5 },
  ];
  return (
    <CustomTable
      title="Usuarios"
      columns={columns}
      apiEndpoint="/api/usuarios"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default UsuariosTable;
