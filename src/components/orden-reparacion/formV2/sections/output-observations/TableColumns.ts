import { GridColDef } from "@mui/x-data-grid";

const TableColumns: GridColDef[] = [
  {
    field: "value",
    headerName: "Observación",
    flex: 1,
    sortable: false,
  },
];

export default TableColumns;
