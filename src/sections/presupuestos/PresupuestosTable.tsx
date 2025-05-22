"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Chip, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddPresupuestoModal from "./AddPresupuestoModal";

// Define the estados for the presupuestos
const estados = ["TODOS", "EnPreparacion", "Enviado", "Aceptado", "Rechazado"];

const estadosDisplay = {
  EnPreparacion: "En Preparación",
  Enviado: "Enviado",
  Aceptado: "Aceptado",
  Rechazado: "Rechazado",
};

const mapEstadoPresupuesto = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "En Preparación";
    case "Enviado":
      return "Enviado";
    case "Aceptado":
      return "Aceptado";
    case "Rechazado":
      return "Rechazado";
    default:
      return "Estado Desconocido";
  }
};

const mapEstadoColor = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "#FFA500"; // Orange
    case "Enviado":
      return "#3498db"; // Blue
    case "Aceptado":
      return "#2ecc71"; // Green
    case "Rechazado":
      return "#e74c3c"; // Red
    default:
      return "#95a5a6"; // Gray
  }
};

function PresupuestosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [estadoActual, setEstadoActual] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < estados.length) {
        setTabValue(tabIndex);
        setEstadoActual(tabIndex === 0 ? null : estados[tabIndex]);
      }
    }
  }, [searchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEstadoActual(newValue === 0 ? null : estados[newValue]);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", newValue.toString());
    window.history.pushState({ tab: newValue }, "", url.toString());
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
      field: "administrativo",
      headerName: "Administrativo",
      flex: 1,
      renderCell: (params: any) => params.row.administrativo?.fullName || "-",
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Chip
            label={mapEstadoPresupuesto(params.row.estado)}
            sx={{
              backgroundColor: mapEstadoColor(params.row.estado),
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
          router.push(`/dashboard/presupuestos/${params.id}/editar`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
      <MenuItem
        key="view"
        onClick={() => router.push(`/dashboard/presupuestos/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {estados.map((estado, index) => (
            <Tab
              key={estado}
              label={estado === "TODOS" ? estado : estadosDisplay[estado]}
            />
          ))}
        </Tabs>
      </Box>
      <Box mt={2}>
        {estadoActual === null && (
          <CustomTable
            title="Presupuestos"
            apiEndpoint="/api/presupuestos"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "EnPreparacion" && (
          <CustomTable
            title="Presupuestos en Preparación"
            apiEndpoint="/api/presupuestos?estado=EnPreparacion"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Enviado" && (
          <CustomTable
            title="Presupuestos Enviados"
            apiEndpoint="/api/presupuestos?estado=Enviado"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Aceptado" && (
          <CustomTable
            title="Presupuestos Aceptados"
            apiEndpoint="/api/presupuestos?estado=Aceptado"
            extraActions={customActions}
            ctaCb={() => setAddModalOpen(true)}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Rechazado" && (
          <CustomTable
            title="Presupuestos Rechazados"
            apiEndpoint="/api/presupuestos?estado=Rechazado"
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
