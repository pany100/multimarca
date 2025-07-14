"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Chip, MenuItem, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function VentasTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
      valueGetter: (cliente: any) => cliente?.fullName || "",
      flex: 1,
    },
    {
      field: "presupuesto",
      headerName: "Presupuesto",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value ? "Presupuesto" : "Terminada"}
          sx={{
            backgroundColor: params.value ? "#4169E1" : "#32CD32",
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
      headerName: "Precio Total",
      flex: 1,
      renderCell: (params: any) =>
        getFormattedPrice(
          calcularTotalOrdenReparacion({
            repuestosUsados: params.row.repuestosUsados,
            reparacionesDeTercero: params.row.reparacionesDeTercero,
            trabajosRealizados: params.row.trabajosRealizados,
            descuento: params.row.descuento,
            incremento: params.row.incremento,
          })
        ),
    },
    {
      field: "pagos",
      headerName: "Pagos",
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Box>
            {getFormattedPrice(
              params.row.ingresos.reduce(
                (total: number, ingreso: any) => total + ingreso.monto,
                0
              )
            )}
          </Box>
        );
      },
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const totalIngresos = params.row.ingresos.reduce(
      (total: number, ingreso: any) => total + ingreso.monto,
      0
    );
    const total = calcularTotalOrdenReparacion({
      repuestosUsados: params.row.repuestosUsados,
      reparacionesDeTercero: params.row.reparacionesDeTercero,
      trabajosRealizados: params.row.trabajosRealizados,
      descuento: params.row.descuento,
      incremento: params.row.incremento,
    });
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
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Todos" />
        <Tab label="Terminados" />
        <Tab label="Presupuestos" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 0 && (
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
        {tabValue === 1 && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?presupuesto=false"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
        {tabValue === 2 && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?presupuesto=true"
            extraActions={customActions}
            ctaCb={() => router.push("/dashboard/ventas/nueva")}
            columns={columns}
            {...rest}
          />
        )}
      </Box>
    </Box>
  );
}

export default VentasTable;
