"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";

function PermisosGastoTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 2 },
    {
      field: "rolesData",
      headerName: "Roles",
      flex: 2,
      valueGetter: (value: any) =>
        value.map((role: any) => role.name).join(", "),
    },
  ];

  return (
    <CustomTable
      title="Permisos de Gasto"
      apiEndpoint="/api/permisos-gasto"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default PermisosGastoTable;
