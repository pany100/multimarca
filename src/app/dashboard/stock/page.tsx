"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Modal,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useState } from "react";
import * as yup from "yup";

interface Stock {
  id: string;
  name: string;
  brand: string;
  buyPrice: number | null;
  units?: number | null;
  restockValue: number | null;
  label: string | null;
  markup: number | null;
  proveedorId: number | null;
  proveedor?: {
    id: number;
    name: string;
  };
}

const StockPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { authFetch } = useFetch();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [porcentajeAumento, setPorcentajeAumento] = useState("");
  const [proveedorOptions, setProveedorOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const handleUpdatePrices = async () => {
    if (!selectedProveedor || !porcentajeAumento) return;

    try {
      const response = await authFetch("/api/stock/update-by-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: selectedProveedor.id,
          porcentajeAumento: parseFloat(porcentajeAumento),
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Precios actualizados con éxito",
          severity: "success",
        });
        setOpenModal(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setSnackbar({
          open: true,
          message: "Error al actualizar precios",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al actualizar precios",
        severity: "error",
      });
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.2 },
    { field: "name", headerName: "Nombre", flex: 0.6 },
    { field: "brand", headerName: "Marca", flex: 0.5 },
    { field: "buyPrice", headerName: "Precio de compra", flex: 0.8 },
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

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text", layout: { xs: 6 } },
    { name: "brand", label: "Marca", type: "text", layout: { xs: 6 } },
    {
      name: "buyPrice",
      label: "Precio de compra",
      type: "number",
      layout: { xs: 4 },
    },
    {
      name: "restockValue",
      label: "Valor de reposición",
      type: "number",
      layout: {
        xs: 4,
      },
    },
    {
      name: "label",
      label: "Rótulo",
      type: "autocomplete",
      layout: { xs: 4 },
      freeSolo: true,
      searchOptions: async (query: string) => {
        const response = await authFetch(`/api/rotulo?query=${query}`);
        const data = await response.json();
        return data.items;
      },
    },
    { name: "markup", label: "Margen", type: "number", layout: { xs: 6 } },
    {
      name: "proveedorId",
      label: "Proveedor",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
          `/api/proveedores?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((proveedor: { name: any; id: any }) => ({
          label: proveedor.name,
          value: proveedor.id,
        }));
      },
      getInitialValue: (stock: Stock) => ({
        value: stock.proveedor?.id || stock.proveedorId,
        label: stock.proveedor?.name || "",
      }),
      layout: { xs: 6 },
    },
  ];

  const createNewStock = (): Stock => {
    return {
      id: "",
      name: "",
      brand: "",
      buyPrice: null,
      restockValue: null,
      label: null,
      markup: null,
      proveedorId: null,
    };
  };
  const getRowClassName = (params: GridRowParams) => {
    if (params.row.units < params.row.restockValue) {
      return "low-stock-row";
    }
    return "";
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="Todos" />
          <Tab label="A Reponer" />
        </Tabs>
      </Box>
      <Box sx={{ width: "100%", mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Actualizar precios por proveedor
        </Button>
      </Box>
      {tabValue === 0 && (
        <CrudTable<Stock>
          title="Stock"
          columns={columns}
          apiEndpoint="/api/stock"
          fields={formFields}
          createNewItem={createNewStock}
          getRowClassName={getRowClassName}
          refreshTrigger={refreshTrigger}
          validationSchema={yup.object({
            name: yup.string().required("El nombre es requerido"),
            brand: yup.string().required("La marca es requerida"),
            buyPrice: yup.number().required("El precio de compra es requerido"),
            proveedorId: yup.number().required("El proveedor es requerido"),
          })}
        />
      )}
      {tabValue === 1 && (
        <CrudTable<Stock>
          title="Restock"
          columns={columns}
          apiEndpoint="/api/stock?needsRestock=true"
          fields={formFields}
          createNewItem={createNewStock}
          getRowClassName={getRowClassName}
          refreshTrigger={refreshTrigger}
          validationSchema={yup.object({
            name: yup.string().required("El nombre es requerido"),
            brand: yup.string().required("La marca es requerida"),
            buyPrice: yup.number().required("El precio de compra es requerido"),
            proveedorId: yup.number().required("El proveedor es requerido"),
          })}
        />
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Actualizar precio por proveedor
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Buscar proveedor y poner el % de aumento que se le va a aplicar a
            todos los repuestos provenientes del mismo
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <Autocomplete
                options={proveedorOptions}
                getOptionLabel={(option: { name: string; id: number }) =>
                  option.name
                }
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" />
                )}
                onChange={(_, newValue) =>
                  setSelectedProveedor(
                    newValue ? { id: newValue.id, name: newValue.name } : null
                  )
                }
                sx={{ mt: 2 }}
                onInputChange={(_, newInputValue) => {
                  if (newInputValue) {
                    fetch(
                      `/api/proveedores?query=${newInputValue}&limit=10&page=0`
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        const options = data.items.map(
                          (proveedor: { name: string; id: number }) => ({
                            id: proveedor.id,
                            name: proveedor.name,
                          })
                        );
                        setProveedorOptions(options);
                      });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Porcentaje de aumento"
                type="number"
                value={porcentajeAumento}
                onChange={(e) => setPorcentajeAumento(e.target.value)}
                sx={{ mt: 2, width: "100%" }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined">
              Descartar
            </Button>
            <Button
              onClick={handleUpdatePrices}
              variant="contained"
              disabled={!selectedProveedor || !porcentajeAumento}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StockPage;
