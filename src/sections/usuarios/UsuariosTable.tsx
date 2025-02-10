import CustomTable from "../../components/tableV2/CustomTable";

type Props = {
  extraActions?: (item: any) => React.ReactNode;
  ctaCb?: () => void;
};

function UsuariosTable({ extraActions, ctaCb }: Props) {
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
    />
  );
}

export default UsuariosTable;
