import { useFetch } from "@/contexts/FetchContext";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  IconButton,
  Menu,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";

export interface CustomTableProps<T> {
  title: string;
  columns: GridColDef[];
  apiEndpoint: string;
  extraActions?: (item: T) => React.ReactNode[];
  ctaCb?: () => void;
  getRowClassName?: (params: GridRowParams) => string;
  refreshTrigger?: number;
}

function CustomTable<T extends { id: string }>({
  title,
  columns,
  apiEndpoint,
  extraActions,
  ctaCb,
  getRowClassName,
  refreshTrigger = 0,
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
                      renderCell: (params: any) => (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, params.row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      ),
                    },
                  ]
                : []),
            ]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
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
