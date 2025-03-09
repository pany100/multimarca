import { useFetch } from "@/contexts/FetchContext";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  IconButton,
  Menu,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";

export interface CustomTableProps<T extends { id: string }> {
  title: string;
  columns: GridColDef[];
  apiEndpoint: string;
  extraActions?: (item: T) => React.ReactNode[];
  ctaCb?: () => void;
  getRowClassName?: (params: GridRowParams) => string;
  refreshTrigger?: number;
  disableMenuForRow?: (item: T) => boolean;
  disabledMenuTooltip?: string;
}

export type InheritedTableProps<T extends { id: string }> = {
  extraActions?: (item: T) => React.ReactNode[];
  ctaCb?: () => void;
  setRefreshTrigger?: React.Dispatch<React.SetStateAction<number>>;
  disableMenuForRow?: (item: T) => boolean;
  disabledMenuTooltip?: string;
} & Omit<
  CustomTableProps<T>,
  | "extraActions"
  | "ctaCb"
  | "title"
  | "columns"
  | "apiEndpoint"
  | "disableMenuForRow"
  | "disabledMenuTooltip"
>;

function CustomTable<T extends { id: string }>({
  title,
  columns,
  apiEndpoint,
  extraActions,
  ctaCb,
  getRowClassName,
  refreshTrigger = 0,
  disableMenuForRow,
  disabledMenuTooltip = "No se pueden realizar acciones en este registro",
}: CustomTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { authFetch } = useFetch();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      url.searchParams.append("page", paginationModel.page.toString());
      url.searchParams.append("size", paginationModel.pageSize.toString());
      if (searchTerm) url.searchParams.append("query", searchTerm);

      const response = await authFetch(url.toString());
      const data = await response.json();
      setItems(Array.isArray(data) ? data : data.items || []);
      setTotalItems(
        typeof data.total === "number"
          ? data.total
          : Array.isArray(data)
          ? data.length
          : 0
      );
    } catch (error) {
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    apiEndpoint,
    paginationModel.page,
    paginationModel.pageSize,
    authFetch,
    searchTerm,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshTrigger]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: T) => {
    if (disableMenuForRow?.(item)) return;
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                  🔍
                </Box>
              ),
            }}
          />
          {ctaCb && (
            <Button
              variant="contained"
              onClick={ctaCb}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                px: 3,
                py: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              AGREGAR {title.toUpperCase()}
            </Button>
          )}
        </Box>
      </Box>

      {!loading && items.length === 0 ? (
        <Typography>No hay datos para mostrar</Typography>
      ) : (
        <>
          <DataGrid
            rows={items}
            columns={[
              ...columns,
              ...(extraActions
                ? [
                    {
                      field: "actions",
                      headerName: "",
                      width: 50,
                      sortable: false,
                      filterable: false,
                      renderCell: (params: any) => {
                        const isDisabled = disableMenuForRow?.(params.row);
                        return (
                          <Tooltip
                            title={isDisabled ? disabledMenuTooltip : ""}
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, params.row)}
                                disabled={isDisabled}
                                sx={{
                                  opacity: isDisabled ? 0.5 : 1,
                                  cursor: isDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        );
                      },
                    },
                  ]
                : []),
            ]}
            autoHeight
            loading={loading}
            getRowClassName={getRowClassName}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            paginationMode="server"
            rowCount={totalItems}
            disableRowSelectionOnClick
            sx={{
              backgroundColor: "background.paper",
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {selectedItem && extraActions?.(selectedItem)}
          </Menu>
        </>
      )}
    </Box>
  );
}

export default CustomTable;
