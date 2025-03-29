import { GridColDef } from "@mui/x-data-grid";

const TableColumns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
    editable: false,
  },
  {
    field: "value",
    headerName: "Observación",
    width: 300,
    editable: false,
  },
];

export default TableColumns;
