import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";
import SettingsIcon from "@mui/icons-material/Settings";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";

function RolesTable({ extraActions, ctaCb, ...rest }: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Rol", flex: 1 },
    {
      field: "permisos",
      headerName: "Permisos",
      flex: 4,
      renderCell: (params: any) => {
        const list = params.row.permisos ?? [];
        return (
          <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
            {list.length ? list.join(", ") : "—"}
          </div>
        );
      },
    },
  ];

  const customActions = (params: any) => {
    const fromAbm = extraActions ? extraActions(params) : [];
    return [
      <MenuItem
        key="administrar"
        onClick={() => router.push(`/dashboard/roles/${params.id}`)}
      >
        <SettingsIcon sx={{ mr: 1 }} />
        Administrar
      </MenuItem>,
      ...fromAbm,
    ];
  };

  return (
    <CustomTable
      title="Roles"
      columns={columns}
      apiEndpoint="/api/roles"
      ctaCb={ctaCb}
      extraActions={customActions}
      {...rest}
    />
  );
}

export default RolesTable;
