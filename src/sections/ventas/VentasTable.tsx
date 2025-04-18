"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Chip, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
function VentasTable({
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
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.5,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.5,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "tipoOperacion",
      headerName: "Tipo de Operación",
      width: 180,
      renderCell: (params: any) => {
        const value = params.value;
        if (value.label === "Cheque" && params.row.chequeId) {
          return (
            <Link
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              Cheque
            </Link>
          );
        }
        return value.label;
      },
    },
    {
      field: "total",
      headerName: "Precio Total",
      flex: 0.5,
      valueGetter: (precioTotal: any) => getFormattedPrice(precioTotal),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 200,
      valueGetter: (cliente: any) => cliente?.fullName || "",
      flex: 1,
    },
    {
      field: "detalle",
      headerName: "Detalle",
      width: 300,
      renderCell: (params: any) => {
        const items = params.row.items || [];
        return (
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: "1.2em",
              padding: "10px 0",
            }}
          >
            {items.map((item: any, index: number) => (
              <Typography
                key={index}
                variant="body2"
                style={{ marginBottom: "5px" }}
              >
                {item.stock.name}: {item.cantidad}
              </Typography>
            ))}
          </div>
        );
      },
      flex: 1.5,
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
  ];

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
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            {...rest}
          />
        )}
        {tabValue === 1 && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?presupuesto=false"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            {...rest}
          />
        )}
        {tabValue === 2 && (
          <CustomTable
            title="Ventas"
            apiEndpoint="/api/ventas?presupuesto=true"
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

export default VentasTable;
