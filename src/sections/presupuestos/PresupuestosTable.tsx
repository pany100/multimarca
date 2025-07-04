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

// Define the estados for the presupuestos
const estados = [
  "TODOS",
  "EnPreparacion",
  "Terminado",
  "Enviado",
  "Aceptado",
  "Rechazado",
  "Descartado",
];

const estadosDisplay = {
  EnPreparacion: "En Preparación",
  Terminado: "Terminado",
  Enviado: "Enviado",
  Aceptado: "Aceptado",
  Rechazado: "Rechazado",
  Descartado: "Descartado",
};

const mapEstadoPresupuesto = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "En Preparación";
    case "Terminado":
      return "Terminado";
    case "Enviado":
      return "Enviado";
    case "Aceptado":
      return "Aceptado";
    case "Rechazado":
      return "Rechazado";
    case "Descartado":
      return "Descartado";
    default:
      return "Estado Desconocido";
  }
};

const mapEstadoColor = (estado: string) => {
  switch (estado) {
    case "EnPreparacion":
      return "#FFA500"; // Orange
    case "Terminado":
      return "#FFD700"; // Dark green
    case "Enviado":
      return "#3498db"; // Blue
    case "Aceptado":
      return "#2ecc71"; // Green
    case "Rechazado":
      return "#e74c3c"; // Red
    case "Descartado":
      return "#9b59b6"; // Purple light
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
      field: "fecha",
      headerName: "Fecha De Creación",
      flex: 1,
      valueGetter: (fecha: string) =>
        fecha ? new Date(fecha).toLocaleDateString("es-AR") : "No ingresado",
    },
    {
      field: "fechaEnvio",
      headerName: "Fecha De Envío",
      flex: 1,
      valueGetter: (fechaEnvio: string) =>
        fechaEnvio
          ? new Date(fechaEnvio).toLocaleDateString("es-AR")
          : "No ingresado",
    },
    {
      field: "vehículo",
      headerName: "Auto",
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {params.row.auto ? (
              <>
                <Typography variant="body2">
                  {params.row.auto.brand} {params.row.auto.model}
                </Typography>
                <Typography>{params.row.auto.patent}</Typography>
              </>
            ) : (
              params.row.informacionAuto || "No ingresado"
            )}
          </Box>
        );
      },
    },
    {
      headerName: "Tema",
      flex: 2,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {params.row.detallesDeTrabajo ||
              params.row.observacionesCliente ||
              "No ingresado"}
          </Box>
        );
      },
    },
    {
      field: "tareasAdministrativas",
      headerName: "Tareas Administrativas",
      flex: 2,
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {params.row.tareasAdministrativas.length > 0
              ? params.row.tareasAdministrativas.map((tarea: any) => (
                  <Typography variant="body2" key={tarea.id}>
                    {tarea.usuario.fullName} - {tarea.descripcion}
                  </Typography>
                ))
              : "No Ingresado"}
          </Box>
        );
      },
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
      renderCell: (params: any) =>
        params.row.auto?.owner?.fullName ||
        params.row.informacionCliente ||
        "No Ingresado",
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
              label={estado === "TODOS" ? estado : mapEstadoPresupuesto(estado)}
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
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "EnPreparacion" && (
          <CustomTable
            title="Presupuestos en Preparación"
            apiEndpoint="/api/presupuestos?estado=EnPreparacion"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Terminado" && (
          <CustomTable
            title="Presupuestos Terminados"
            apiEndpoint="/api/presupuestos?estado=Terminado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Enviado" && (
          <CustomTable
            title="Presupuestos Enviados"
            apiEndpoint="/api/presupuestos?estado=Enviado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Aceptado" && (
          <CustomTable
            title="Presupuestos Aceptados"
            apiEndpoint="/api/presupuestos?estado=Aceptado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Rechazado" && (
          <CustomTable
            title="Presupuestos Rechazados"
            apiEndpoint="/api/presupuestos?estado=Rechazado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
        {estadoActual === "Descartado" && (
          <CustomTable
            title="Presupuestos Descartados"
            apiEndpoint="/api/presupuestos?estado=Descartado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/presupuestos/nuevo")}
            columns={columns}
            {...rest}
          />
        )}
      </Box>
    </Box>
  );
}

export default PresupuestosTable;
