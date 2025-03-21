"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";

function ChequesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`/dashboard/cheques/${params.row.id}`}
          style={{ textDecoration: "underline" }}
        >
          {params.row.id.toString()}
        </Link>
      ),
    },
    {
      field: "numero",
      headerName: "Número",
      flex: 1,
    },
    {
      field: "fechaEmision",
      headerName: "Fecha Emisión",
      flex: 1,
      renderCell: (params) => {
        return new Date(params.row.fechaEmision).toLocaleDateString("es-AR");
      },
    },
    {
      field: "fechaCobro",
      headerName: "Fecha Cobro",
      flex: 1,
      renderCell: (params) => {
        const fechaCobro = new Date(params.row.fechaCobro);
        const hoy = new Date();
        const diferenciaDias = Math.floor(
          (fechaCobro.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        let backgroundColor = "#ADD8E6"; // celeste por defecto
        if (diferenciaDias < 3 && diferenciaDias >= 0) {
          backgroundColor = "#FF6B6B"; // rojo si faltan menos de 3 días
        } else if (diferenciaDias < 0 && diferenciaDias > -3) {
          backgroundColor = "#FFFF00"; // amarillo si pasaron menos de 3 días
        }

        return (
          <Box
            sx={{ backgroundColor, padding: "4px 8px", borderRadius: "4px" }}
          >
            {fechaCobro.toLocaleDateString("es-AR")}
          </Box>
        );
      },
    },
    {
      field: "banco",
      headerName: "Banco",
      flex: 1,
    },
    {
      field: "importe",
      headerName: "Importe",
      flex: 1,
      renderCell: (params) => {
        return params.row.importe.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        });
      },
    },
    {
      field: "owner",
      headerName: "Emisor",
      flex: 1,
    },
  ];

  return (
    <CustomTable
      title="Cheques"
      apiEndpoint="/api/cheques"
      extraActions={extraActions}
      ctaCb={ctaCb}
      columns={columns}
      {...rest}
    />
  );
}

export default ChequesTable;
