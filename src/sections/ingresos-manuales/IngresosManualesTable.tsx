import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip } from "@mui/material";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function IngresosManualesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (value: any) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.7,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      field: "usuario",
      headerName: "Usuario",
      flex: 1.5,
      valueGetter: (value: any) => value.fullName,
    },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "tipoExtraccion",
      headerName: "Tipo de Operación",
      flex: 1.5,
      renderCell: (params: any) => {
        if (params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO") {
          return "DEBITO AUTOMATICO";
        }
        if (params.value === "CHEQUE" && params.row.chequeId) {
          return (
            <a
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              CHEQUE
            </a>
          );
        }
        return params.value;
      },
    },
  ];

  return (
    <CustomTable
      title="Ingresos Manuales"
      apiEndpoint="/api/ingresos-manuales"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default IngresosManualesTable;
