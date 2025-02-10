import CustomTable, {
  CustomTableProps,
} from "../../components/tableV2/CustomTable";

type Props = {
  extraActions?: (item: any) => React.ReactNode[];
  ctaCb?: () => void;
} & Omit<
  CustomTableProps,
  "extraActions" | "ctaCb" | "title" | "columns" | "apiEndpoint"
>;

function UsuariosTable({ extraActions, ctaCb, ...rest }: Props) {
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
