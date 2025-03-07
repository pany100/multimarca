import { getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function StockTable({
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
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "name", headerName: "Nombre", flex: 0.6 },
    { field: "brand", headerName: "Marca", flex: 0.5 },
    {
      field: "buyPrice",
      headerName: "Precio de compra",
      flex: 0.8,
      valueGetter: (buyPrice: any) => getFormattedPrice(buyPrice),
    },
    {
      field: "units",
      headerName: "Unidades",
      width: 100,
      valueGetter: (units: any) => {
        return units === null || units === undefined ? 0 : units;
      },
      flex: 0.5,
    },
    { field: "restockValue", headerName: "Valor de reposición", flex: 0.5 },
    { field: "label", headerName: "Rótulo", flex: 0.5 },
    { field: "markup", headerName: "Margen", flex: 0.5 },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 1.5,
      renderCell: (params: any) => params.row.proveedor?.name || "",
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.units < params.row.restockValue) {
      return "low-stock-row";
    }
    return "";
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Todos" />
        <Tab label="Stock Bajo" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 1 ? (
          <CustomTable
            title="Stock Bajo"
            apiEndpoint="/api/stock?needsRestock=true"
            extraActions={extraActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Stock"
            apiEndpoint="/api/stock"
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

export default StockTable;
