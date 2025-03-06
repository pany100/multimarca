import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ClientesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
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

  return (
    <CustomTable
      columns={columns}
      title="Clientes"
      apiEndpoint="/api/clientes"
      extraActions={extraActions}
      ctaCb={ctaCb}
      {...rest}
    />
  );
}

export default ClientesTable;
