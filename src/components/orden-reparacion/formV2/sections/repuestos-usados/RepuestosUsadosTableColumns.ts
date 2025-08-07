import { getFormattedPrice } from "@/utils/fieldHelper";
import { GridColDef } from "@mui/x-data-grid";

const RepuestosUsadosTableColumns: GridColDef[] = [
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
    headerName: "Label",
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
    field: "precioVenta",
    headerName: "Precio Venta",
    flex: 1,
    valueFormatter: (value) => getFormattedPrice(value),
  },
  {
    field: "unidadesConsumidas",
    headerName: "Unidades Consumidas",
    flex: 1,
  },
];

export default RepuestosUsadosTableColumns;
