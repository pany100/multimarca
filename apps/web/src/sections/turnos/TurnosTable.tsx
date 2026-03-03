"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function TurnosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.6,
      valueGetter: (value: any) => {
        return new Date(value).toLocaleDateString("es-AR");
      },
    },
    {
      field: "hora",
      headerName: "Hora",
      flex: 0.4,
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.auto?.owner) {
          return params.row.auto.owner.fullName;
        }
        return params.row.clienteNombre || "No ingresado";
      },
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.auto?.owner) {
          return params.row.auto.owner.phone || "";
        }
        return params.row.clienteTelefono || "";
      },
    },
    {
      field: "vino",
      headerName: "Vino",
      flex: 0.5,
      renderCell: (params: any) => {
        if (params.row.vino == null) return "—";
        return params.row.vino ? "Sí" : "No";
      },
    },
    {
      field: "observaciones",
      headerName: "Observaciones",
      flex: 1,
      renderCell: (params: any) => {
        const obs = params.row.observaciones;
        if (!obs) return "—";
        return obs.length > 40 ? `${obs.slice(0, 40)}…` : obs;
      },
    },
    {
      field: "auto",
      headerName: "Auto",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.auto) {
          return `${params.row.auto.brand} ${params.row.auto.model} - ${params.row.auto.patent}`;
        }
        return params.row.informacionAuto || "No ingresado";
      },
    },
    {
      field: "problema",
      headerName: "Problema",
      flex: 1.5,
    },
  ];

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Próximos" />
        <Tab label="Todos" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 0 ? (
          <CustomTable
            title="Próximos Turnos"
            apiEndpoint="/api/turnos?upcoming=true"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Todos los Turnos"
            apiEndpoint="/api/turnos"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            {...rest}
          />
        )}
      </Box>
    </Box>
  );
}

export default TurnosTable;
