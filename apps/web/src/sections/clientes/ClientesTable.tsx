import VisibilityIcon from "@mui/icons-material/Visibility";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ClientesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullName", headerName: "Nombre completo", flex: 1.5 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "cars",
      headerName: "Vehículos",
      flex: 3,
      renderCell: (params: any) => (
        <ul>
          {params.row.cars?.map((car: any) => (
            <li key={car.id}>{`${car.brand} ${car.model} (${car.patent})`}</li>
          ))}
        </ul>
      ),
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/clientes/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver Cliente
      </MenuItem>,
      ,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      columns={columns}
      title="Clientes"
      apiEndpoint="/api/clientes"
      extraActions={customActions}
      ctaCb={ctaCb}
      {...rest}
    />
  );
}

export default ClientesTable;
