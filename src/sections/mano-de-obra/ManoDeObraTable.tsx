import { getFormattedPrice } from "@/utils/fieldHelper";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ManoDeObraTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Trabajo", flex: 2 },
    {
      field: "sellPrice",
      headerName: "Precio de Venta",
      flex: 1,
      renderCell: (params: any) => getFormattedPrice(params.value),
    },
  ];

  return (
    <>
      <CustomTable
        title="Mano de Obra"
        apiEndpoint="/api/mano-de-obra"
        extraActions={extraActions}
        ctaCb={ctaCb}
        columns={columns}
        {...rest}
      />
    </>
  );
}

export default ManoDeObraTable;
