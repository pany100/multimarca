"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import { getFormattedPrice } from "@/utils/fieldHelper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Chip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ResumenTransaccionesTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const getViewLink = (params: any) => {
    const { tipo, id } = params.row;

    switch (tipo) {
      case "Gasto":
        return `/dashboard/gastos/${id}/ver`;
      case "Extraccion":
        return `/dashboard/extracciones/${id}/ver`;
      case "IngresoPorVenta":
        return `/dashboard/ingresos-ventas/${id}/ver`;
      case "IngresoPorReparacion":
        return `/dashboard/ingresos-reparacion/${id}/ver`;
      case "IngresoManualDeDinero":
        return `/dashboard/ingresos-manuales/${id}/ver`;
      default:
        return "#";
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString("es-AR");
      },
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params) => {
        let color = "default";
        let label = params.value;

        switch (params.value) {
          case "Gasto":
            color = "error";
            break;
          case "Extraccion":
            color = "warning";
            break;
          case "IngresoPorVenta":
            color = "success";
            label = "Ingreso por Venta";
            break;
          case "IngresoPorReparacion":
            color = "success";
            label = "Ingreso por Reparación";
            break;
          case "IngresoManualDeDinero":
            color = "info";
            label = "Ingreso Manual";
            break;
        }

        return <Chip label={label} color={color as any} size="small" />;
      },
    },
    {
      field: "tipoOperacion",
      headerName: "Operación",
      flex: 1,
      valueGetter: (value: any) => value?.label || "N/A",
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueFormatter: (value) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "detalleEntidad",
      headerName: "Entidad",
      flex: 1.5,
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1.5,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Link href={getViewLink(params)}>
          <VisibilityIcon color="primary" />
        </Link>
      ),
    },
  ];

  return (
    <CustomTable
      title="Resumen de Transacciones"
      columns={columns}
      apiEndpoint="/api/resumen-transacciones"
      ctaCb={ctaCb}
      extraActions={extraActions}
      searchByDate={true}
      {...rest}
    />
  );
}

export default ResumenTransaccionesTable;
