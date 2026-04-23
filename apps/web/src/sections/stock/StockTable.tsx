import useExportStock from "@/hooks/useExportStock";
import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularPrecioVenta } from "@/utils/stock-pricing";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  // pending = lo que el usuario selecciona en el Autocomplete (no dispara fetch)
  // committed = lo que efectivamente filtra la tabla (se actualiza al clickear Buscar)
  const [proveedorPending, setProveedorPending] = useState<{ label: string; value: number } | null>(null);
  const [proveedorCommitted, setProveedorCommitted] = useState<{ label: string; value: number } | null>(null);
  const [proveedorOptions, setProveedorOptions] = useState<{ label: string; value: number }[]>([]);
  const [proveedorLoading, setProveedorLoading] = useState(false);
  const [sectorPending, setSectorPending] = useState("");
  const [sectorCommitted, setSectorCommitted] = useState("");

  const { searchProveedores } = useProveedorAutocomplete();
  const { exportFilteredToPdf, isLoadingFiltered } = useExportStock();

  const fetchProveedores = useMemo(
    () =>
      debounce(async (query: string) => {
        setProveedorLoading(true);
        try {
          const results = await searchProveedores(query);
          setProveedorOptions(results as { label: string; value: number }[]);
        } finally {
          setProveedorLoading(false);
        }
      }, 300),
    [searchProveedores]
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "name", headerName: "Nombre", flex: 0.7 },
    { field: "brand", headerName: "Marca", flex: 0.4 },
    { field: "label", headerName: "Rótulo", flex: 0.4 },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 0.6,
      renderCell: (params: any) => params.row.proveedor?.name || "",
    },
    {
      field: "buyPrice",
      headerName: "P. Compra",
      flex: 0.5,
      valueGetter: (buyPrice: any) => getFormattedPrice(buyPrice),
    },
    {
      field: "markup",
      headerName: "Margen",
      flex: 0.35,
      renderCell: (params: any) =>
        params.row.markup != null ? `${params.row.markup}%` : "-",
    },
    {
      field: "buyIva",
      headerName: "IVA Compra",
      flex: 0.4,
      renderCell: (params: any) =>
        params.row.buyIva != null ? `${params.row.buyIva}%` : "-",
    },
    {
      field: "sellIva",
      headerName: "IVA Venta",
      flex: 0.4,
      renderCell: (params: any) =>
        params.row.sellIva != null ? `${params.row.sellIva}%` : "-",
    },
    {
      field: "sellPrice",
      headerName: "P. Venta",
      flex: 0.5,
      renderCell: (params: any) =>
        getFormattedPrice(calcularPrecioVenta(params.row.buyPrice, params.row.markup, params.row.sellIva) ?? 0),
    },
    {
      field: "units",
      headerName: "Uds.",
      flex: 0.3,
      valueGetter: (units: any) => {
        if (units === null || units === undefined) return 0;
        return Number(units);
      },
    },
    { field: "restockValue", headerName: "Reposición", flex: 0.35 },
    {
      field: "fraccionable",
      headerName: "Fracc.",
      flex: 0.25,
      valueGetter: (fraccionable: any) =>
        fraccionable === true ? "Sí" : "No",
    },
    { field: "sector", headerName: "Sector", flex: 0.35 },
    { field: "reportName", headerName: "Reporte", flex: 0.4 },
    { field: "carBrand", headerName: "Marca Auto", flex: 0.4 },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const units = Number(params.row.units ?? 0);
    const restock = Number(params.row.restockValue ?? 0);
    if (units < restock) {
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
      <MenuItem
        key="manage-stock"
        onClick={() => {
          const id = params?.id ?? params?.row?.id;
          if (!id) return;
          router.push(`/dashboard/stock/${id}`);
        }}
      >
        <SettingsIcon sx={{ mr: 1 }} />
        Administrar stock
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  const filterQueryString = [
    proveedorCommitted ? `proveedorId=${proveedorCommitted.value}` : "",
    sectorCommitted ? `sector=${encodeURIComponent(sectorCommitted)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const handleSearchClick = () => {
    setProveedorCommitted(proveedorPending);
    setSectorCommitted(sectorPending);
  };

  const handleClearClick = () => {
    setProveedorPending(null);
    setProveedorCommitted(null);
    setProveedorOptions([]);
    setSectorPending("");
    setSectorCommitted("");
  };

  const handleExportFiltered = () => {
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("query") || undefined;
    exportFilteredToPdf({
      query,
      proveedorId: proveedorCommitted?.value ?? null,
      sector: sectorCommitted || undefined,
      needsRestock: tabValue === 1,
    });
  };

  const filtersSlot = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        flexWrap: "wrap",
        gap: 1.5,
        width: { xs: "100%", sm: "auto" },
      }}
    >
      <Autocomplete
        size="small"
        options={proveedorOptions}
        loading={proveedorLoading}
        value={proveedorPending}
        onChange={(_, newValue) => setProveedorPending(newValue)}
        onInputChange={(_, newInputValue, reason) => {
          if (newInputValue.length >= 2 && reason !== "reset") {
            fetchProveedores(newInputValue);
          }
          if (newInputValue.length < 2) {
            setProveedorOptions([]);
          }
        }}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.label}
        noOptionsText="No hay opciones"
        sx={{ width: { xs: "100%", sm: 240 } }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Proveedor"
            variant="outlined"
            size="small"
          />
        )}
      />
      <TextField
        size="small"
        label="Sector"
        value={sectorPending}
        onChange={(e) => setSectorPending(e.target.value)}
        sx={{ width: { xs: "100%", sm: 200 } }}
      />
    </Stack>
  );

  const secondaryActions = (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleExportFiltered}
      disabled={isLoadingFiltered}
      startIcon={
        isLoadingFiltered ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <PictureAsPdfIcon />
        )
      }
      sx={{
        height: 40,
        px: 2,
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 1,
        whiteSpace: "nowrap",
      }}
    >
      {isLoadingFiltered ? "Generando PDF..." : "Exportar búsqueda"}
    </Button>
  );

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Todos" />
        <Tab label="Stock Bajo" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 1 ? (
          <CustomTable
            title="Stock Bajo"
            apiEndpoint={`/api/stock?needsRestock=true${
              filterQueryString ? `&${filterQueryString}` : ""
            }`}
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            filterSlot={filtersSlot}
            secondaryActions={secondaryActions}
            onSearchClick={handleSearchClick}
            onClearClick={handleClearClick}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Stock"
            apiEndpoint={`/api/stock${
              filterQueryString ? `?${filterQueryString}` : ""
            }`}
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            filterSlot={filtersSlot}
            secondaryActions={secondaryActions}
            onSearchClick={handleSearchClick}
            onClearClick={handleClearClick}
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
