import { useRouter } from "next/navigation";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ControlesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Control", flex: 1.5 },
    { field: "type", headerName: "Tipo", flex: 1 },
    {
      field: "pdfName",
      headerName: "Nombre para el detalle",
      flex: 1.5,
      renderCell: (params: any) => params.row.pdfName || params.row.name,
    },
    {
      field: "ordenEnPdf",
      headerName: "Orden en PDF",
      flex: 1,
      renderCell: (params: any) => params.value || "N/A",
    },
  ];

  return (
    <CustomTable
      title="Controles Mecánicos"
      apiEndpoint="/api/controles-mecanicos"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default ControlesTable;
