"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Typography } from "@mui/material";

function OrdenDeCompraTable({
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
      field: "precioTotal",
      headerName: "Precio Total",
      flex: 0.5,
      valueGetter: (precioTotal: any) => getFormattedPrice(precioTotal),
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      width: 200,
      valueGetter: (proveedor: any) => proveedor?.name || "",
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
      title="Órdenes de Compra"
      apiEndpoint="/api/orden-de-compra"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default OrdenDeCompraTable;
