"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Chip, MenuItem, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { EstadoVenta } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function Stock({ repuestos }: { repuestos: any[] }) {
  return (
    <Box>
      {repuestos.map((repuesto) => (
        <Box key={repuesto.id} sx={{ mb: 1 }}>
          * {repuesto.stock.name} - {repuesto.unidadesConsumidas}u
        </Box>
      ))}
    </Box>
  );
}

function Reparaciones({ reparaciones }: { reparaciones: any[] }) {
  return (
    <Box>
      {reparaciones.map((reparacion) => (
        <Box sx={{ mb: 1 }} key={reparacion.id}>
          * {reparacion.nombre}
        </Box>
      ))}
    </Box>
  );
}

function Trabajos({ trabajos }: { trabajos: any[] }) {
  return (
    <Box>
      {trabajos.map((trabajo) => (
        <Box key={trabajo.id} sx={{ mb: 1 }}>
          * {trabajo.descripcion}
        </Box>
      ))}
    </Box>
  );
}

// Define estado display names and colors
const estadosDisplay: Record<EstadoVenta, string> = {
  [EstadoVenta.Presupuestado]: "Presupuestado",
  [EstadoVenta.Preparado]: "Preparado",
  [EstadoVenta.Entregado]: "Entregado",
  [EstadoVenta.Cerrado]: "Cerrado",
};

const estadoColors: Record<EstadoVenta, string> = {
  [EstadoVenta.Presupuestado]: "#4169E1", // Royal Blue
  [EstadoVenta.Preparado]: "#FF8C00", // Dark Orange
  [EstadoVenta.Entregado]: "#32CD32", // Lime Green
  [EstadoVenta.Cerrado]: "#8A2BE2", // Blue Violet
};

const estados = [
  "TODOS",
  EstadoVenta.Presupuestado,
  EstadoVenta.Preparado,
  EstadoVenta.Entregado,
  EstadoVenta.Cerrado,
];

function VentasTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tabValue, setTabValue] = useState(0);
  const [estadoActual, setEstadoActual] = useState<EstadoVenta | string | null>(
    null
  );

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
      headerName: "Fecha",
      flex: 0.5,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 200,
      renderCell: (params: any) => {
        return (
          <Box>
            {params.row.cliente?.fullName || params.row.informacionCliente}
          </Box>
        );
      },
      flex: 1,
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={estadosDisplay[params.value as EstadoVenta] || params.value}
          sx={{
            backgroundColor:
              estadoColors[params.value as EstadoVenta] || "#757575",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "detalles",
      headerName: "Detalles De Venta",
      flex: 2,
      renderCell: (params: any) => {
        return (
          <Box sx={{ mt: 1 }}>
            <Stock repuestos={params.row.repuestosUsados} />
            <Reparaciones reparaciones={params.row.reparacionesDeTercero} />
            <Trabajos trabajos={params.row.trabajosRealizados} />
          </Box>
        );
      },
    },
    {
      field: "precioTotal",
      headerName: "Total a Pagar",
      flex: 1,
      renderCell: (params: any) => getFormattedPrice(params.row.precioTotal),
    },
    {
      field: "totalPagado",
      headerName: "Total Pagado",
      flex: 1.5,
      renderCell: (params: any) => getFormattedPrice(params.row.totalPagado),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const totalIngresos = params.row.totalPagado;
    const total = params.row.precioTotal;
    if (totalIngresos < total) {
      return "low-stock-row";
    } else if (totalIngresos > total) {
      return "high-row";
    }
    return "";
  };

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/ventas/${params.id}/editar`)}
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
      <MenuItem
        key="view"
        onClick={() => router.push(`/dashboard/ventas/${params.id}/ver`)}
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
              label={
                estado === "TODOS"
                  ? estado
                  : estadosDisplay[estado as EstadoVenta]
              }
            />
          ))}
        </Tabs>
      </Box>
      <Box mt={2}>
        {estadoActual === null && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
        {estadoActual === EstadoVenta.Presupuestado && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?estado=Presupuestado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
        {estadoActual === EstadoVenta.Preparado && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?estado=Preparado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
        {estadoActual === EstadoVenta.Entregado && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?estado=Entregado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
        {estadoActual === EstadoVenta.Cerrado && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?estado=Cerrado"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
      </Box>
    </Box>
  );
}

export default VentasTable;
