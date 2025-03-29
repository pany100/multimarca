import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useFormContext } from "react-hook-form";

type Props = {
  fieldName: string;
  emptyContent: React.ComponentType<any>;
  columns: GridColDef[];
  rowsTransform?: (row: any, index: number) => any;
};

function FormDataArrayWithModal({
  fieldName,
  emptyContent: EmptyContent,
  columns,
  rowsTransform,
}: Props) {
  const { watch } = useFormContext();
  const values = watch(fieldName);
  const rows = typeof values === "string" ? JSON.parse(values || "[]") : values;

  if (!rows || rows.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: "1px dashed #ccc",
          borderRadius: 1,
          mb: 2,
          backgroundColor: "action.hover",
        }}
      >
        <EmptyContent />
      </Box>
    );
  }

  function getItem(id: number) {
    const rowsTransformed = rowsTransform ? rows.map(rowsTransform) : rows;
    return rowsTransformed.find((r: any) => r.id === id);
  }

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "Acciones",
    headerAlign: "center",
    renderCell: (params) => (
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            const item = getItem(params.row.id);
            console.log(item);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={() => {
            const item = getItem(params.row.id);
            console.log(item);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  };

  return (
    <>
      <DataGrid
        rows={rowsTransform ? rows.map(rowsTransform) : rows}
        columns={[...columns, actionColumn]}
        getRowId={(row) => row.id}
        autoHeight
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
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
          },
        }}
      />
    </>
  );
}

export default FormDataArrayWithModal;
