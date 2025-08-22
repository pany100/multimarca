import VisibilityIcon from "@mui/icons-material/Visibility";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ProveedoresTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "numeroProveedor", headerName: "Número de proveedor", flex: 1 },
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    { field: "mobile", headerName: "Móvil", flex: 1 },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="view"
        onClick={() => router.push(`/dashboard/proveedores/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver estado de cuenta
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Proveedores"
      apiEndpoint="/api/proveedores"
      extraActions={customActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default ProveedoresTable;
