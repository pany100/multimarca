"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import EditIcon from "@mui/icons-material/Edit";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";

function PlantillaPresupuestoTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() =>
          router.push(`/dashboard/plantilla-presupuesto/${params.id}/editar`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Plantillas de Presupuesto"
      apiEndpoint="/api/plantilla-presupuesto"
      extraActions={customActions}
      ctaCb={() => {
        router.push("/dashboard/plantilla-presupuesto/nuevo");
      }}
      columns={columns}
      {...rest}
    />
  );
}

export default PlantillaPresupuestoTable;
