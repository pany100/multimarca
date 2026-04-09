import { getFormattedPrice } from "@/utils/fieldHelper";
import { GridColDef } from "@mui/x-data-grid";

const AjustesPrecioTableColumns: GridColDef[] = [
  {
    field: "descripcion",
    headerName: "Descripcion",
    flex: 3,
  },
  {
    field: "monto",
    headerName: "Monto",
    flex: 1,
    valueGetter: (_value, row) => {
      if (row.tipo === "porcentual") return `${row.monto}%`;
      return getFormattedPrice(row.monto);
    },
  },
  {
    field: "tipo",
    headerName: "Tipo",
    flex: 1,
    valueGetter: (value) => (value === "porcentual" ? "Porcentual" : "Fijo"),
  },
  {
    field: "esDescuento",
    headerName: "Efecto",
    flex: 1,
    valueGetter: (value) => (value ? "Descuento" : "Incremento"),
  },
  {
    field: "esInterno",
    headerName: "Interno",
    flex: 0.7,
    valueGetter: (value) => (value ? "Si" : "No"),
  },
];

export default AjustesPrecioTableColumns;
