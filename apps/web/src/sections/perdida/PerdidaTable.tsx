"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import BalanceIcon from "@mui/icons-material/Balance";
import { Box, MenuItem, Typography } from "@mui/material";
import { format } from "date-fns";
import Link from "next/link";
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

          // If there's cotizacion info, show the equivalent in pesos
          if (params.row.cotizacionDolar) {
            const pesosEquivalent = Number(monto) * Number(params.row.cotizacionDolar);
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
      field: "pendiente",
      headerName: "Pendiente a Recuperar",
      flex: 1,
      renderCell: (params: any) => {
        const monto = Number(params.row.monto);
        const moneda = params.row.moneda;
        const recuperaciones = params.row.recuperaciones || [];

        const totalRecuperado = recuperaciones.reduce(
          (acc: number, rec: any) => acc + Number(rec.monto),
          0
        );

        const pendiente = monto - totalRecuperado;
        const porcentajePendiente = monto > 0 ? (pendiente / monto) * 100 : 0;

        let formattedPendiente;
        if (moneda === "Dolar") {
          formattedPendiente = `U$D ${pendiente.toFixed(2)}`;

          // If there's cotizacion info, show the equivalent in pesos
          if (params.row.cotizacionDolar) {
            const pesosEquivalent = pendiente * Number(params.row.cotizacionDolar);
            formattedPendiente += ` (${getFormattedPrice(pesosEquivalent)})`;
          }
        } else {
          formattedPendiente = getFormattedPrice(pendiente);
        }

        return (
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {formattedPendiente}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {porcentajePendiente.toFixed(2)}% pendiente
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "recuperaciones",
      headerName: "Recuperaciones",
      flex: 1.5,
      renderCell: (params: any) => {
        const recuperaciones = params.row.recuperaciones || [];
        const moneda = params.row.moneda;

        return recuperaciones.length > 0 ? (
          <Box>
            {recuperaciones.map((rec: any) => (
              <Typography
                key={rec.id}
                variant="body2"
                sx={{
                  "& a": {
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  },
                  mb: 0.5,
                }}
              >
                <Link href={`/dashboard/perdida/${params.row.id}/recupero`}>
                  * {format(new Date(rec.fecha), "dd/MM/yyyy")}:{" "}
                  {moneda === "Dolar"
                    ? `U$D ${Number(rec.monto).toFixed(2)}`
                    : getFormattedPrice(rec.monto)}
                  {rec.detalle ? ` - ${rec.detalle}` : ""}
                </Link>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sin recuperaciones
          </Typography>
        );
      },
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/perdida/${params.id}/recupero`)}
      >
        <BalanceIcon sx={{ mr: 1 }} />
        Recuperos
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Pérdidas"
      apiEndpoint="/api/perdida"
      extraActions={customActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default PerdidaTable;
