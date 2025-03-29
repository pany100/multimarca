import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { useModalContext } from "@/contexts/ModalContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useFormContext } from "react-hook-form";

type Props = {
  rowsTransform?: (row: any, index: number) => any;
  columns: GridColDef[];
  rows: any[];
  fieldName: string;
};

function FormDataTable({ rowsTransform, columns, rows, fieldName }: Props) {
  const { setModalOpen } = useModalContext();
  const { setCurrentItem } = useFormDataWithModalContext();
  const { watch, setValue } = useFormContext();
  const values = watch(fieldName);

  return (
    <DataGrid
      rows={rowsTransform ? rows.map(rowsTransform) : rows}
      columns={[
        ...columns,
        {
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
                  const rowsTransformed = rowsTransform
                    ? rows.map(rowsTransform)
                    : rows;
                  const item = rowsTransformed.find(
                    (r: any) => r.id === params.row.id
                  );
                  if (typeof values === "string") {
                    setCurrentItem(item?.value);
                  } else {
                    setCurrentItem(item);
                  }
                  setModalOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => {
                  const rowsTransformed = rowsTransform
                    ? rows.map(rowsTransform)
                    : rows;
                  const item = rowsTransformed.find(
                    (r: any) => r.id === params.row.id
                  );
                  let index = null;
                  if (typeof values === "string") {
                    index = JSON.parse(values).findIndex(
                      (r: any) => r.id === item.value
                    );
                  } else {
                    index = values.findIndex(
                      (r: any) => r.id === params.row.id
                    );
                  }
                  const newValues = [...values];
                  newValues.splice(index, 1);
                  setValue(fieldName, JSON.stringify(newValues));
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ),
        },
      ]}
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
  );
}

export default FormDataTable;
