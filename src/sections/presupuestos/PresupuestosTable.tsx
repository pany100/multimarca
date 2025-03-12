"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Chip, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddPresupuestoModal from "./AddPresupuestoModal";
function PresupuestosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const [tabValue, setTabValue] = useState<number>(0);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "fechaCreacion",
      headerName: "Fecha De Creación",
      flex: 1,
      valueGetter: (fechaCreacion: string) =>
        fechaCreacion
          ? new Date(fechaCreacion).toLocaleDateString("es-AR")
          : "No ingresado",
    },
    {
      field: "vehículo",
      headerName: "Auto",
      flex: 2,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {params.row.auto.brand} {params.row.auto.model}
          </Typography>
          <Typography>{params.row.auto.patent}</Typography>
        </Box>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.ingresos !== undefined) {
          return (
            <Chip
              label="Presupuestado"
              sx={{
                backgroundColor: "#FFA500",
                color: "white",
                fontWeight: "bold",
              }}
            />
          );
        }
        return (
          <Chip
            label="Borrador"
            sx={{
              backgroundColor: "#808080",
              color: "white",
              fontWeight: "bold",
            }}
          />
        );
      },
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params: any) => params.row.auto.owner.fullName,
    },
    {
      field: "totalAPagar",
      headerName: "Total a Pagar",
      flex: 1,
      renderCell: (params: any) =>
        getFormattedPrice(calcularTotalOrdenReparacion(params.row)),
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() =>
          router.push(`/dashboard/ordenes-reparacion/${params.id}/editar`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
      <MenuItem
        key="view"
        onClick={() =>
          router.push(`/dashboard/ordenes-reparacion/${params.id}/ver`)
        }
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Presupuestos" />
        <Tab label="Borradores" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 0 ? (
          <CustomTable
            title="Presupuestos"
            apiEndpoint="/api/orden-reparacion?estado=Presupuestado"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Borradores"
            apiEndpoint="/api/borradores"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        )}
      </Box>
      <AddPresupuestoModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </Box>
  );
}

export default PresupuestosTable;
