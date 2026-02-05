import { GridRowParams } from "@mui/x-data-grid";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function InformacionSensibleTable({
  extraActions,
  ctaCb,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "titulo", headerName: "Título", flex: 2 },
    {
      field: "texto",
      headerName: "Texto",
      flex: 3,
      renderCell: (params: any) => {
        const texto = params.value || "";
        return texto.length > 100 ? `${texto.substring(0, 100)}...` : texto;
      },
    },
  ];

  return (
    <CustomTable
      title="Información Sensible"
      columns={columns}
      apiEndpoint="/api/informacion-sensible"
      ctaCb={ctaCb}
      extraActions={extraActions}
      {...rest}
    />
  );
}

export default InformacionSensibleTable;
