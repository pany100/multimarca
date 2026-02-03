import { getFormattedPrice } from "@/utils/fieldHelper";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { Alert, Box, MenuItem, Snackbar, Tab, Tabs } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";
import UpdateStockModal from "./UpdateStockModal";

function StockTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const [tabValue, setTabValue] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
    { field: "reportName", headerName: "Nombre de Reporte", flex: 0.5 },
    { field: "sector", headerName: "Sector", flex: 0.5 },
    { field: "carBrand", headerName: "Marca de Auto", flex: 0.5 },
    {
      field: "sellPrice",
      headerName: "Precio de venta sugerido",
      flex: 0.8,
      renderCell: (params: any) =>
        getFormattedPrice(params.row.buyPrice * (1 + params.row.markup / 100)),
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

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="update-stock"
        onClick={() => {
          setSelectedStock(params);
          setIsEditModalOpen(true);
        }}
      >
        <Inventory2Icon sx={{ mr: 1 }} />
        Actualizar Stock
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
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
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Stock"
            apiEndpoint="/api/stock"
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            {...rest}
          />
        )}
      </Box>
      {selectedStock && (
        <UpdateStockModal
          isEditModalOpen={isEditModalOpen}
          handleCloseEdit={() => setIsEditModalOpen(false)}
          handleEditSuccess={() => {
            setFeedback({
              type: "success",
              message: "Stock actualizado correctamente",
            });
            setSelectedStock(null);
            setIsEditModalOpen(false);
            setRefreshTrigger && setRefreshTrigger((prev) => prev + 1);
          }}
          handleEditError={() => {
            setFeedback({
              type: "error",
              message: "Error al actualizar stock",
            });
            setSelectedStock(null);
            setIsEditModalOpen(false);
          }}
          entity={selectedStock}
        />
      )}
      <Snackbar
        open={!!feedback}
        autoHideDuration={6000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {feedback ? (
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback.type}
            variant="filled"
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default StockTable;
