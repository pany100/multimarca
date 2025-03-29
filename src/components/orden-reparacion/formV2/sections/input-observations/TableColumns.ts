import { GridColDef } from "@mui/x-data-grid";

const TableColumns: GridColDef[] = [
  {
    field: "value",
    headerName: "Observación",
    flex: 1,
    editable: false,
  },
];

export default TableColumns;
