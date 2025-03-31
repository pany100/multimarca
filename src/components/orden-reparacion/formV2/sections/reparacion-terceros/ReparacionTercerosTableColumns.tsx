import { getFormattedPrice } from "@/utils/fieldHelper";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";

export const ReparacionTercerosTableColumns: GridColDef[] = [
  {
    field: "proveedor",
    headerName: "Proveedor",
    flex: 1,
    valueFormatter: (value: { name: string }) => value?.name,
  },
  {
    field: "nombre",
    headerName: "Descripción",
    flex: 1,
  },
  {
    field: "precioCompra",
    headerName: "Precio Compra",
    flex: 1,
    valueFormatter: (value: number) => getFormattedPrice(value),
  },
  {
    field: "precioVenta",
    headerName: "Precio Venta",
    flex: 1,
    valueFormatter: (value: number) => getFormattedPrice(value),
  },
  {
    field: "recibo",
    headerName: "Recibo",
    flex: 1,
    renderCell: (params: any) => {
      const recibo = params.row.recibo;
      if (recibo) {
        return (
          <Link href={recibo} target="_blank">
            <Button size="small" color="primary" startIcon={<ReceiptIcon />}>
              Ver recibo
            </Button>
          </Link>
        );
      } else {
        return (
          <Typography variant="body2" color="text.secondary">
            Sin recibo
          </Typography>
        );
      }
    },
  },
];
