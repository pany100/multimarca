import { useFetch } from "@/contexts/FetchContext";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

export interface CustomTableProps {
  title?: string;
  columns: GridColDef[];
  apiEndpoint: string;
  extraActions?: (item: any) => React.ReactNode[];
  ctaCb?: () => void;
  getRowClassName?: (params: GridRowParams) => string;
  refreshTrigger?: number;
  disableMenuForRow?: (item: any) => boolean;
  searchByDate?: boolean;
}

export type InheritedTableProps = {
  extraActions?: (item: any) => React.ReactNode[];
  ctaCb?: () => void;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
} & Omit<
  CustomTableProps,
  "extraActions" | "ctaCb" | "title" | "columns" | "apiEndpoint"
>;

function CustomTable<T extends { id: string }>({
  title,
  columns,
  apiEndpoint,
  extraActions,
  ctaCb,
  getRowClassName,
  disableMenuForRow,
  refreshTrigger = 0,
  searchByDate = false,
}: CustomTableProps) {
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const isUrlUpdateNeeded = useRef(true);
  const pendingFetch = useRef(false);
  const currentRequestId = useRef<number>(0);

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    if (!searchByDate) return null;
    const fromParam = searchParams.get("from");
    return fromParam ? new Date(fromParam) : null;
  });
  const [toDate, setToDate] = useState<Date | null>(() => {
    if (!searchByDate) return null;
    const toParam = searchParams.get("to");
    return toParam ? new Date(toParam) : null;
  });
  const [fromDateInput, setFromDateInput] = useState<Date | null>(() => {
    if (!searchByDate) return null;
    const fromParam = searchParams.get("from");
    return fromParam ? new Date(fromParam) : null;
  });
  const [toDateInput, setToDateInput] = useState<Date | null>(() => {
    if (!searchByDate) return null;
    const toParam = searchParams.get("to");
    return toParam ? new Date(toParam) : null;
  });
  const [items, setItems] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { authFetch } = useFetch();

  // Initialize state from URL parameters only on first mount
  useEffect(() => {
    if (isInitialMount.current) {
      const page = searchParams.get("page");
      const pageSize = searchParams.get("pageSize");
      const query = searchParams.get("query");

      let stateChanged = false;

      // Initialize pagination from URL
      if (page !== null && pageSize !== null) {
        const pageNum = parseInt(page);
        const pageSizeNum = parseInt(pageSize);

        if (!isNaN(pageNum) && !isNaN(pageSizeNum)) {
          setPaginationModel({
            page: pageNum,
            pageSize: pageSizeNum,
          });
          stateChanged = true;
        }
      }

      // Initialize search term from URL
      if (query !== null) {
        setSearchTerm(query);
        setSearchInput(query);
        stateChanged = true;
      }

      // Initialize date inputs from URL
      if (searchByDate) {
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");
        if (fromParam) {
          setFromDateInput(new Date(fromParam));
        }
        if (toParam) {
          setToDateInput(new Date(toParam));
        }
      }

      isInitialMount.current = false;

      // If we initialized state from URL, don't update URL on first fetch
      if (stateChanged) {
        isUrlUpdateNeeded.current = false;
      }

      // Set pendingFetch to true to trigger a fetch after initialization
      pendingFetch.current = true;
    }
  }, [searchParams, searchByDate]);

  // Listen for popstate events (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      // Set loading to true to prevent showing stale data
      setLoading(true);

      const url = new URL(window.location.href);
      const page = url.searchParams.get("page");
      const pageSize = url.searchParams.get("pageSize");
      const query = url.searchParams.get("query");

      // Batch state updates to avoid multiple fetches
      let updatedPagination = { ...paginationModel };
      let updatedSearchTerm = searchTerm;

      if (page !== null && pageSize !== null) {
        const pageNum = parseInt(page);
        const pageSizeNum = parseInt(pageSize);

        if (!isNaN(pageNum) && !isNaN(pageSizeNum)) {
          updatedPagination = {
            page: pageNum,
            pageSize: pageSizeNum,
          };
        }
      }

      if (query !== null) {
        updatedSearchTerm = query;
      } else {
        updatedSearchTerm = "";
      }

      // Update date inputs from URL
      if (searchByDate) {
        const fromParam = url.searchParams.get("from");
        const toParam = url.searchParams.get("to");
        setFromDateInput(fromParam ? new Date(fromParam) : null);
        setToDateInput(toParam ? new Date(toParam) : null);
      }

      // Update state in a batch
      setPaginationModel(updatedPagination);
      setSearchTerm(updatedSearchTerm);
      setSearchInput(updatedSearchTerm);

      // Don't update URL when handling popstate
      isUrlUpdateNeeded.current = false;

      // Set pendingFetch to true to trigger a single fetch after all state updates
      pendingFetch.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [paginationModel, searchTerm, searchByDate]);

  // Update URL when pagination or search changes
  const updateUrl = useCallback(
    (page: number, pageSize: number, query: string) => {
      if (!isUrlUpdateNeeded.current) {
        isUrlUpdateNeeded.current = true;
        return;
      }

      const url = new URL(window.location.href);

      // Set parameters
      url.searchParams.set("page", page.toString());
      url.searchParams.set("pageSize", pageSize.toString());

      if (query) {
        url.searchParams.set("query", query);
      } else {
        url.searchParams.delete("query");
      }

      // Add date parameters if searchByDate is true
      if (searchByDate) {
        if (fromDate) {
          const formattedDate = fromDate.toISOString().split("T")[0];
          url.searchParams.set("from", formattedDate);
        } else {
          url.searchParams.delete("from");
        }

        if (toDate) {
          const formattedDate = toDate.toISOString().split("T")[0];
          url.searchParams.set("to", formattedDate);
        } else {
          url.searchParams.delete("to");
        }
      }

      // Check for return parameters and preserve them
      const returnParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        if (key.startsWith("return")) {
          returnParams[key] = value;
        }
      });

      // Update browser history without reloading the page
      window.history.pushState({ page, pageSize, query }, "", url.toString());
    },
    [searchByDate, fromDate, toDate]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Generate a unique request ID for this fetch
      const requestId = ++currentRequestId.current;

      // Extract any additional query parameters from the current URL
      const currentUrl = new URL(window.location.href);
      const additionalParams: Record<string, string> = {};

      // Get all query parameters except page, pageSize, and query which we'll set separately
      currentUrl.searchParams.forEach((value, key) => {
        if (
          !["page", "pageSize", "query", "from", "to", "return"].some((param) =>
            key.startsWith(param)
          )
        ) {
          additionalParams[key] = value;
        }
      });

      const url = new URL(apiEndpoint, window.location.origin);

      // Add all additional parameters first
      Object.entries(additionalParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      // Then add pagination and search parameters
      url.searchParams.append("page", paginationModel.page.toString());
      url.searchParams.append("size", paginationModel.pageSize.toString());
      if (searchTerm) url.searchParams.append("query", searchTerm);

      // Add date parameters if searchByDate is true
      if (searchByDate) {
        if (fromDate) {
          const formattedDate = fromDate.toISOString().split("T")[0];
          url.searchParams.append("from", formattedDate);
        }
        if (toDate) {
          const formattedDate = toDate.toISOString().split("T")[0];
          url.searchParams.append("to", formattedDate);
        }
      }

      const response = await authFetch(url.toString());
      const data = await response.json();

      // Only update state if this is the most recent request
      if (requestId === currentRequestId.current) {
        setItems(Array.isArray(data) ? data : data.items || []);
        setTotalItems(
          typeof data.total === "number"
            ? data.total
            : Array.isArray(data)
            ? data.length
            : 0
        );

        // Update URL with current state
        updateUrl(paginationModel.page, paginationModel.pageSize, searchTerm);
      }

      // Reset pendingFetch flag
      pendingFetch.current = false;
    } catch (error) {
      setItems([]);
      setTotalItems(0);
      pendingFetch.current = false;
    } finally {
      setLoading(false);
    }
  }, [
    apiEndpoint,
    paginationModel.page,
    paginationModel.pageSize,
    authFetch,
    searchTerm,
    fromDate,
    toDate,
    searchByDate,
    updateUrl,
  ]);

  // Trigger fetch when dependencies change or when pendingFetch is true
  useEffect(() => {
    // Use a small timeout to batch potential multiple state changes
    const timeoutId = setTimeout(() => {
      if (pendingFetch.current || !isInitialMount.current) {
        fetchItems();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [fetchItems, refreshTrigger]);

  const handleFromDateInputChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setFromDateInput(dateValue);
  };

  const handleToDateInputChange = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    if (context.validationError) {
      return; // No actualizar si hay error de validación
    }
    // Convertir el valor a Date si es necesario
    const dateValue =
      value instanceof Date ? value : value && new Date(value.toString());
    setToDateInput(dateValue);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    if (searchByDate) {
      setFromDate(fromDateInput);
      setToDate(toDateInput);
    }
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
    pendingFetch.current = true;

    // Force fetch immediately after state changes
    setTimeout(() => {
      fetchItems();
    }, 0);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    if (searchByDate) {
      setFromDateInput(null);
      setToDateInput(null);
      setFromDate(null);
      setToDate(null);
    }
    setPaginationModel({ ...paginationModel, page: 0 });
    pendingFetch.current = true;

    // Force fetch immediately after clearing
    setTimeout(() => {
      fetchItems();
    }, 0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: T) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Handle pagination model change
  const handlePaginationModelChange = (newModel: any) => {
    setPaginationModel(newModel);
    pendingFetch.current = true;
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
        {title && (
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
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flexWrap: "wrap" }}
          >
            <TextField
              placeholder="Buscar..."
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
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
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchInput("")}
                      sx={{ p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {searchByDate && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <DatePicker
                      label="Desde"
                      value={fromDateInput}
                      onChange={handleFromDateInputChange}
                      format="dd-MM-yyyy"
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            width: 200,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "background.paper",
                            },
                          },
                        },
                      }}
                    />
                    {fromDateInput && (
                      <IconButton
                        size="small"
                        onClick={() => setFromDateInput(null)}
                        sx={{
                          position: "absolute",
                          right: 35,
                          top: "50%",
                          transform: "translateY(-50%)",
                          p: 0.5,
                          zIndex: 1,
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <DatePicker
                      label="Hasta"
                      value={toDateInput}
                      onChange={handleToDateInputChange}
                      format="dd-MM-yyyy"
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            width: 200,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "background.paper",
                            },
                          },
                        },
                      }}
                    />
                    {toDateInput && (
                      <IconButton
                        size="small"
                        onClick={() => setToDateInput(null)}
                        sx={{
                          position: "absolute",
                          right: 35,
                          top: "50%",
                          transform: "translateY(-50%)",
                          p: 0.5,
                          zIndex: 1,
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Stack>
              </LocalizationProvider>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={handleSearchSubmit}
              startIcon={<SearchIcon />}
              sx={{
                minWidth: "auto",
                px: 2,
                height: "40px", // Match the height of small TextField
                backgroundColor: (theme) => theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              }}
            >
              Buscar
            </Button>
          </Stack>
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
              AGREGAR {title?.toUpperCase() || "Elemento"}
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
                        if (isDisabled) return null;
                        return (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, params.row)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        );
                      },
                    },
                  ]
                : []),
            ]}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 20, 30]}
            rowCount={totalItems}
            paginationMode="server"
            filterMode="server"
            loading={loading}
            getRowId={(row) => row.id}
            getRowClassName={getRowClassName}
            getRowHeight={() => "auto"}
            sx={{
              border: 1,
              borderColor: "divider",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: (theme) => theme.palette.primary.main,
                fontSize: "0.875rem",
                fontWeight: 600,
              },
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
                minHeight: "50px",
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-row": {
                minHeight: "50px !important",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              },
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {selectedItem && extraActions && extraActions(selectedItem)}
          </Menu>
        </>
      )}
    </Box>
  );
}

export default CustomTable;
