import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip } from "@mui/material";
import Link from "next/link";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function ExtraccionesTable({
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
    { field: "motivo", headerName: "Motivo", flex: 2 },
    {
      field: "tipoOperacion",
      headerName: "Tipo de Extracción",
      flex: 1.5,
      renderCell: (params: any) => {
        const value = params.value;
        if (value.label === "Cheque" && params.row.chequeId) {
          return (
            <Link
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              Cheque
            </Link>
          );
        }
        return value.label;
      },
    },
  ];

  return (
    <CustomTable
      title="Extracciones"
      apiEndpoint="/api/extracciones"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default ExtraccionesTable;
