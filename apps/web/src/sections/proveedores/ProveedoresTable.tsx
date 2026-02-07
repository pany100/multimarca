import { useFetch } from "@/contexts/FetchContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Checkbox, MenuItem } from "@mui/material";
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
  const { authFetch } = useFetch();

  const handleRevisadoChange = async (
    event: any,
    row: {
      id: number;
    }
  ) => {
    try {
      const response = await authFetch(`/api/proveedores/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ revisado: event.target.checked }),
      });
      if (response.ok) {
        setRefreshTrigger && setRefreshTrigger((prev) => prev + 1);
      } else {
        console.error("Error al actualizar revisado:", response.status);
      }
    } catch (error) {
      console.error("Error al actualizar revisado:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "numeroProveedor", headerName: "Número de proveedor", flex: 1 },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "alias",
      headerName: "Alias",
      flex: 1,
      renderCell: (params: any) => params.row.alias ?? "-",
    },
    {
      field: "cuit",
      headerName: "CUIT",
      flex: 1,
      renderCell: (params: any) => params.row.cuit ?? "-",
    },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    { field: "mobile", headerName: "Móvil", flex: 1 },
    {
      field: "revisado",
      headerName: "Revisado",
      flex: 0.5,
      renderCell: (params: any) => (
        <Checkbox
          checked={params.row.revisado || false}
          onChange={(event) => handleRevisadoChange(event, params.row)}
        />
      ),
    },
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
