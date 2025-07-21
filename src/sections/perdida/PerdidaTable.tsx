"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Chip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

function PerdidaTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      renderCell: (params: any) => {
        const monto = params.row.monto;
        const moneda = params.row.moneda;
        const dolar = params.row.dolar;

        if (moneda === "Dolar") {
          let formattedMonto = `U$D ${Number(monto).toFixed(2)}`;

          // If there's dolar info, show the equivalent in pesos
          if (dolar) {
            const pesosEquivalent = Number(monto) * Number(dolar.blue);
            formattedMonto += ` (${getFormattedPrice(pesosEquivalent)})`;
          }

          return <Typography variant="body2">{formattedMonto}</Typography>;
        }

        return (
          <Typography variant="body2">{getFormattedPrice(monto)}</Typography>
        );
      },
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1.5,
      renderCell: (params: any) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.2em",
            padding: "10px 0",
          }}
        >
          <Typography variant="body2">{params.row.descripcion}</Typography>
        </div>
      ),
    },
    {
      field: "cancelado",
      headerName: "Estado",
      flex: 0.8,
      renderCell: (params: any) => {
        const cancelado = params.row.cancelado;
        return (
          <Chip
            icon={cancelado ? <CheckCircleIcon /> : <CancelIcon />}
            label={cancelado ? "Cancelado" : "Pendiente"}
            color={cancelado ? "success" : "error"}
            size="small"
          />
        );
      },
    },
  ];

  return (
    <CustomTable
      title="Pérdidas"
      apiEndpoint="/api/perdida"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default PerdidaTable;
