"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Chip, MenuItem } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";

function GastosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Descripción", flex: 1.5 },
    {
      field: "precio",
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
      headerName: "Tipo Operación",
      flex: 1,
      renderCell: (params: any) => {
        const value = params.value;
        if (value === null) {
          return "No especificado";
        }
        if (value.label === "Cheque" && params.row.chequeId) {
          const cheque = params.row.cheque;
          return (
            <Link
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              Cheque {cheque.rechazado ? "(Rechazado, revisar)" : ""}
            </Link>
          );
        }
        return value.label;
      },
    },
    { field: "detalle", headerName: "Detalle", flex: 1.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) => new Date(value).toLocaleDateString("es-ES"),
    },
    {
      field: "categoria",
      headerName: "Categoría",
      flex: 1.5,
      valueGetter: (value: any) => value?.nombre || "",
    },
    {
      field: "mecanico",
      headerName: "Empleado",
      flex: 1,
      valueGetter: (value: any) => value?.name || "-",
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 1.5,
      valueGetter: (value: any) => value?.name || "-",
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.chequeId) {
      const cheque = params.row.cheque;
      if (cheque.rechazado) {
        return "low-stock-row";
      }
    }
    return "";
  };

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="view"
        onClick={() => router.push(`/dashboard/gastos/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <CustomTable
      title="Gastos"
      apiEndpoint="/api/gastos"
      extraActions={customActions}
      ctaCb={ctaCb}
      columns={columns}
      getRowClassName={getRowClassName}
      searchByDate={true}
      {...rest}
    />
  );
}

export default GastosTable;
