"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip, Typography } from "@mui/material";

function VentasTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 1,
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
        if (params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO") {
          return "DEBITO AUTOMATICO";
        }
        if (params.value === "CHEQUE") {
          return (
            <a
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              CHEQUE
            </a>
          );
        }
        return params.value;
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
  ];

  return (
    <CustomTable
      title="Ventas"
      apiEndpoint="/api/ventas"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default VentasTable;
