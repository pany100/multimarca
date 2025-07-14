import { GridRowParams } from "@mui/x-data-grid";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function UsuariosTable({ extraActions, ctaCb, ...rest }: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullName", headerName: "Nombre completo", flex: 2 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "username", headerName: "Usuario", flex: 1.5 },
    {
      field: "activo",
      headerName: "Activo",
      flex: 1.5,
      renderCell: (params: any) => (params.value ? "Sí" : "No"),
    },
    { field: "rol", headerName: "Rol", flex: 1.5 },
  ];

  const getRowClassName = (params: GridRowParams) => {
    if (!params.row.activo) {
      return "low-stock-row";
    }
    return "";
  };
  return (
    <CustomTable
      title="Usuarios"
      columns={columns}
      apiEndpoint="/api/usuarios"
      ctaCb={ctaCb}
      extraActions={extraActions}
      getRowClassName={getRowClassName}
      {...rest}
    />
  );
}

export default UsuariosTable;
