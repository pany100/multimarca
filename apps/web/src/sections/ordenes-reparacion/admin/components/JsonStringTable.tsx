"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ReactNode } from "react";

interface JsonStringTableProps {
  jsonString: string;
  columnName: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  emptyMessage?: ReactNode;
  loading?: boolean;
}

const JsonStringTable = ({
  jsonString,
  columnName,
  onEdit,
  onDelete,
  emptyMessage,
  loading = false,
}: JsonStringTableProps) => {
  // Parse JSON string
  let rows: any[] = [];
  try {
    rows = jsonString ? JSON.parse(jsonString) : [];
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    rows = [];
  }

  // Transform rows to table format
  const transformedRows = rows.map((row, index) => ({
    id: index + 1,
    value: row,
  }));

  // Show empty message if no rows
  if (!rows || rows.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        {emptyMessage || "No hay datos para mostrar"}
      </Box>
    );
  }

  // Build columns with actions if callbacks provided
  const tableColumns: GridColDef[] = [
    {
      field: "value",
      headerName: columnName,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.5",
            padding: "8px 0",
          }}
        >
          {params.value}
        </div>
      ),
    },
  ];

  if (onEdit || onDelete) {
    tableColumns.push({
      field: "actions",
      headerName: "Acciones",
      headerAlign: "center",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          {onEdit && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                const item = transformedRows.find(
                  (r: any) => r.id === params.row.id
                );
                onEdit(item);
              }}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              color="error"
              size="small"
              onClick={() => {
                const item = transformedRows.find(
                  (r: any) => r.id === params.row.id
                );
                onDelete(item);
              }}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    });
  }

  return (
    <DataGrid
      rows={transformedRows}
      columns={tableColumns}
      getRowId={(row) => row.id}
      autoHeight
      hideFooter
      disableColumnMenu
      disableRowSelectionOnClick
      loading={loading}
      sx={{
        border: 1,
        borderColor: "divider",
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: "primary.light",
          color: "white",
          fontSize: "0.875rem",
          fontWeight: 600,
        },
        "& .MuiDataGrid-filler": {
          backgroundColor: "primary.light",
        },
        "& .MuiDataGrid-cell": {
          display: "flex",
          alignItems: "center",
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
        "& .MuiDataGrid-row": {
          maxHeight: "none !important",
        },
      }}
      getRowHeight={() => "auto"}
    />
  );
};

export default JsonStringTable;
