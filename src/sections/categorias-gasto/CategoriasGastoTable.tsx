"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";

const nonEditableItems = [1, 2, 3];

function CategoriasGastoTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Nombre", flex: 2 },
  ];

  return (
    <CustomTable
      title="Categorías de Gasto"
      apiEndpoint="/api/categorias-gasto"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      disableMenuForRow={(item) => nonEditableItems.includes(item.id)}
      {...rest}
    />
  );
}

export default CategoriasGastoTable;
