import { getFormattedPrice } from "@/utils/fieldHelper";
import { GridColDef } from "@mui/x-data-grid";

export const getRepuestosUsadosTableColumns = (): GridColDef[] => [
  {
    field: "stock",
    headerName: "Repuesto",
    flex: 3,
    valueFormatter: (value: { name: string }) => value?.name,
  },
  {
    field: "proveedor",
    headerName: "Proveedor",
    flex: 1,
    valueFormatter: (value: { name: string }) => value?.name,
  },
  {
    field: "label",
    headerName: "Rótulo",
    flex: 1,
    valueFormatter: (value: { name: string }) => value?.name,
  },
  {
    field: "precioCompra",
    headerName: "Precio Compra",
    flex: 1,
    valueGetter: (value) => getFormattedPrice(value),
  },
  {
    field: "unidadesConsumidas",
    headerName: "Unidades Consumidas",
    flex: 1,
  },
  {
    field: "precioVenta",
    headerName: "Precio Final",
    flex: 1,
    valueFormatter: (value) => getFormattedPrice(value),
  },
];
