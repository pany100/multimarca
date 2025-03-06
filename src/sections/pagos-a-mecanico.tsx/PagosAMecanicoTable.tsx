import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function PagosAMecanicoTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "ordenReparacion",
      headerName: "ID Reparación",
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${
          ordenReparacion.auto.brand || ""
        } ${ordenReparacion.auto.model || ""}
        - ${ordenReparacion.auto.owner.name || ""} ${
          ordenReparacion.auto.owner.fullName || ""
        } - ${
          ordenReparacion.fechaEntradaReparacion
            ? new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString("es-AR")
            : "sin fecha de ingreso"
        }`,
      flex: 4,
    },
    {
      field: "mecanico",
      headerName: "Mecánico",
      renderCell: (params: any) => {
        const mecanicos = params.row.ordenReparacion?.mecanicos || [];
        return mecanicos.length > 0
          ? mecanicos.map((m: any) => `${m.mecanico.name}`).join(", ")
          : "NO ASIGNADO";
      },
      flex: 2,
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (monto: any) =>
        monto ? getFormattedPrice(monto) : "NO PAGADO",
    },
    {
      field: "fechaPago",
      headerName: "Fecha de Pago",
      flex: 1,
      valueGetter: (fechaPago: any) =>
        fechaPago ? new Date(fechaPago).toLocaleDateString() : "NO PAGADO",
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.monto === null) {
      return "low-stock-row";
    }
    return "";
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Todos" />
        <Tab label="Pendientes" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 1 ? (
          <CustomTable
            title="Mecánico Pendientes"
            apiEndpoint="/api/pago-a-mecanico?onlyNullMonto=true"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Pagos a Mecánico"
            apiEndpoint="/api/pago-a-mecanico"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
      </Box>
    </Box>
  );
}

export default PagosAMecanicoTable;
