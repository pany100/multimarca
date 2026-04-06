import useProveedorAutocomplete from "@/hooks/useProveedorAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SettingsIcon from "@mui/icons-material/Settings";
import { Alert, Autocomplete, Box, MenuItem, Snackbar, Tab, Tabs, TextField } from "@mui/material";
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

  const { searchProveedores } = useProveedorAutocomplete();

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
        if (units === null || units === undefined) return 0;
        return Number(units);
      },
      flex: 0.5,
    },
    {
      field: "fraccionable",
      headerName: "Fraccionable (Para litros)",
      flex: 0.5,
      valueGetter: (fraccionable: any) =>
        fraccionable === true ? "Sí" : "No",
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

  const proveedorQuery = proveedorCommitted ? `&proveedorId=${proveedorCommitted.value}` : "";

  const handleSearchClick = () => {
    setProveedorCommitted(proveedorPending);
  };

  const handleClearClick = () => {
    setProveedorPending(null);
    setProveedorCommitted(null);
    setProveedorOptions([]);
  };

  const proveedorFilterSlot = (
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
      sx={{ width: { xs: "100%", sm: 260 } }}
      renderInput={(params) => (
        <TextField {...params} label="Filtrar por proveedor" variant="outlined" size="small" />
      )}
    />
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
            apiEndpoint={`/api/stock?needsRestock=true${proveedorQuery}`}
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            filterSlot={proveedorFilterSlot}
            onSearchClick={handleSearchClick}
            onClearClick={handleClearClick}
            {...rest}
          />
        ) : (
          <CustomTable
            title="Stock"
            apiEndpoint={`/api/stock${proveedorCommitted ? `?proveedorId=${proveedorCommitted.value}` : ""}`}
            extraActions={customActions}
            ctaCb={ctaCb}
            columns={columns}
            getRowClassName={getRowClassName}
            filterSlot={proveedorFilterSlot}
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
