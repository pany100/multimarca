"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { ComprobanteAdeudado } from "@/hooks/deudores/useDeudores";
import { getFormattedPrice } from "@/utils/fieldHelper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, MenuItem, Tooltip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComprobantesAdeudadosModal from "./ComprobantesAdeudadosModal";

function DeudoresTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const [detalle, setDetalle] = useState<{
    clienteNombre: string;
    comprobantes: ComprobanteAdeudado[];
  } | null>(null);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
    },
    {
      field: "patente",
      headerName: "Patente",
      flex: 1,
    },

    {
      field: "cliente_nombre",
      headerName: "Cliente",
      flex: 1.5,
    },
    {
      field: "cliente_phone",
      headerName: "Teléfono",
      flex: 1,
      valueGetter: (phone) => phone || "-",
    },
    {
      field: "deuda_total",
      headerName: "Deuda Total",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            sx={{
              fontWeight: "bold",
              color: params.row.deuda_total > 50000 ? "error.main" : "inherit",
            }}
          >
            {getFormattedPrice(params.row.deuda_total)}
          </Typography>
        );
      },
    },
    {
      field: "detalle",
      headerName: "Detalle",
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Ver comprobantes adeudados">
          <IconButton
            size="small"
            onClick={() =>
              setDetalle({
                clienteNombre: params.row.cliente_nombre,
                comprobantes: params.row.comprobantes ?? [],
              })
            }
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/clientes/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver Cliente
      </MenuItem>,
      ,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <>
      <CustomTable
        title="Deudores"
        apiEndpoint="/api/deudores"
        searchByDate
        defaultFromDate={new Date(2026, 0, 22)}
        fetchOnMount={false}
        onlyFromDate
        extraActions={customActions}
        ctaCb={ctaCb}
        columns={columns}
        {...rest}
      />
      <ComprobantesAdeudadosModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        clienteNombre={detalle?.clienteNombre ?? ""}
        comprobantes={detalle?.comprobantes ?? []}
      />
    </>
  );
}

export default DeudoresTable;
