import { GridColDef } from "@mui/x-data-grid";

const MechanicsTableColumns: GridColDef[] = [
  {
    field: "name",
    headerName: "Mecánico",
    flex: 1,
  },
  {
    field: "detalle",
    headerName: "Detalle",
    flex: 1,
    renderCell: (params) => params.row.detalle || "-",
  },
];

export default MechanicsTableColumns;
