"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

function DeudoresTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
    },
    {
      field: "fullName",
      headerName: "Cliente",
      flex: 1.5,
    },
    {
      field: "dni",
      headerName: "DNI",
      flex: 1,
      valueGetter: (dni) => dni || "-",
    },
    {
      field: "phone",
      headerName: "Teléfono",
      flex: 1,
      valueGetter: (phone) => phone || "-",
    },
    {
      field: "totalDeuda",
      headerName: "Deuda Total",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            sx={{
              fontWeight: "bold",
              color: params.row.totalDeuda > 50000 ? "error.main" : "inherit",
            }}
          >
            {getFormattedPrice(params.row.totalDeuda)}
          </Typography>
        );
      },
    },
    {
      field: "ventas",
      headerName: "Ventas Pendientes",
      flex: 1,
      renderCell: (params) => {
        const ventasPendientes = params.row.ventas || [];
        if (ventasPendientes.length === 0) return "-";

        return (
          <Tooltip
            title={
              <Box>
                {ventasPendientes.map((venta: any) => (
                  <Box key={venta.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      ID: {venta.id} - Fecha:{" "}
                      {new Date(venta.fecha).toLocaleDateString("es-AR")}
                    </Typography>
                    <Typography variant="body2">
                      Total: {getFormattedPrice(venta.total)} - Pendiente:{" "}
                      {getFormattedPrice(venta.pendiente)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
            arrow
          >
            <Chip
              label={`${ventasPendientes.length} venta${
                ventasPendientes.length !== 1 ? "s" : ""
              }`}
              color="primary"
              variant="outlined"
            />
          </Tooltip>
        );
      },
    },
    {
      field: "reparaciones",
      headerName: "Reparaciones Pendientes",
      flex: 1.5,
      renderCell: (params) => {
        const reparacionesPendientes = params.row.reparaciones || [];
        if (reparacionesPendientes.length === 0) return "-";

        return (
          <Tooltip
            title={
              <Box>
                {reparacionesPendientes.map((reparacion: any) => (
                  <Box key={reparacion.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      ID: {reparacion.id} - Fecha:{" "}
                      {new Date(reparacion.fecha).toLocaleDateString("es-AR")}
                    </Typography>
                    <Typography variant="body2">
                      Auto: {reparacion.auto}
                    </Typography>
                    <Typography variant="body2">
                      Total: {getFormattedPrice(reparacion.total)} - Pendiente:{" "}
                      {getFormattedPrice(reparacion.pendiente)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
            arrow
          >
            <Chip
              label={`${reparacionesPendientes.length} reparación${
                reparacionesPendientes.length !== 1 ? "es" : ""
              }`}
              color="secondary"
              variant="outlined"
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <CustomTable
      title="Deudores"
      apiEndpoint="/api/deudores"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default DeudoresTable;
