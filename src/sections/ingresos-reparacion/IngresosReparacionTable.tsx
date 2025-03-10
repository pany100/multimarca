"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip } from "@mui/material";

function IngresosReparacionTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) => new Date(value).toLocaleDateString("es-AR"),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (value: any) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "tipoOperacion",
      headerName: "Tipo de Ingreso",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO") {
          return "DEBITO AUTOMATICO";
        }
        if (params.value === "CHEQUE") {
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
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1.5,
      valueGetter: (value: any) => value?.fullName || "",
    },
    {
      field: "ordenReparacion",
      headerName: "Orden de Reparación",
      flex: 2,
      valueGetter: (value: any) =>
        `#${value.id} - ${value.auto.patent} ${value.auto.brand} ${
          value.auto.model
        }: ${
          value.fechaEntradaReparacion
            ? new Date(value.fechaEntradaReparacion).toLocaleDateString("es-AR")
            : "Sin Fecha de entrada"
        }`,
    },
    {
      field: "reciboEnviado",
      headerName: "Recibo Enviado",
      flex: 1,
      valueGetter: (value: any) => (value ? "Sí" : "No"),
    },
  ];

  return (
    <CustomTable
      title="Ingresos por Reparación"
      apiEndpoint="/api/ingresos-reparacion"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default IngresosReparacionTable;
