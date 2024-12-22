"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import * as yup from "yup";

interface OrdenDeCompra {
  id: string;
  fecha: string;
  precioTotal: number | null;
  proveedorId: number | null;
  proveedor: {
    name: string;
  };
  items: Array<{
    id: string;
    cantidad: number | null;
    stockId: number | string;
    stock: {
      name: string;
    };
  }>;
}

const OrdenDeCompraPage = () => {
  const [items, setItems] = useState<OrdenDeCompra["items"]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    id: string;
    cantidad: number | null;
    stockId: number | string;
    stock: {
      name: string;
    };
  }>({
    id: "",
    stockId: 0,
    stock: { name: "" },
    cantidad: null,
  });
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [stockOptions, setStockOptions] = useState<
    Array<{ id: number; name: string; label: string }>
  >([]);
  const { authFetch } = useFetch();

  useEffect(() => {
    const searchStock = async () => {
      if (proveedorId) {
        const response = await authFetch(
          `/api/proveedores/${proveedorId}/stock?&page=0&size=100`
        );
        const data = await response.json();
        const results = data.items.map(
          (stock: { name: string; id: number; label: string }) => ({
            id: stock.id,
            name: stock.name,
            label: stock.label,
          })
        );
        setStockOptions(results);
      }
    };

    setItems([]);
    searchStock();
  }, [proveedorId, authFetch]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "precioTotal",
      headerName: "Precio Total",
      flex: 0.5,
      valueGetter: (precioTotal: any) => getFormattedPrice(precioTotal),
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      width: 200,
      valueGetter: (proveedor: any) => proveedor?.name || "",
      flex: 1,
    },
    {
      field: "detalle",
      headerName: "Detalle",
      width: 300,
      renderCell: (params: any) => {
        const items = params.row.items || [];
        return (
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: "1.2em",
              padding: "10px 0",
            }}
          >
            {items.map((item: any, index: number) => (
              <Typography
                key={index}
                variant="body2"
                style={{ marginBottom: "5px" }}
              >
                {item.stock.name}: {item.cantidad}
              </Typography>
            ))}
          </div>
        );
      },
      flex: 1.5,
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "fecha", label: "Fecha", type: "date" },
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
      getInitialValue: (ordenDeCompra: OrdenDeCompra) => {
        const value = {
          value: ordenDeCompra.proveedorId,
          label: ordenDeCompra.proveedor?.name || "",
        };
        setProveedorId(ordenDeCompra.proveedorId);
        return value;
      },
      onChange: (
        value: { value: number; label: string } | null,
        setValue: UseFormSetValue<any>
      ) => {
        setProveedorId(value?.value ?? null);
        setValue("items", []);
      },
    },
    {
      name: "items",
      label: "Items",
      type: "custom",
      render: (value, onChange, error) => {
        const currentItems = (value as OrdenDeCompra["items"]) || [];
        if (currentItems.length > 0) {
          setItems(currentItems);
        }
        return (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stock</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <TableRow
                      key={item.id}
                      sx={
                        index === items.length - 1
                          ? {
                              "&:last-child td, &:last-child th": { border: 0 },
                            }
                          : {}
                      }
                    >
                      <TableCell>{item.stock.name}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            const newItems = items.filter((i) => i !== item);
                            setItems(newItems);
                            onChange(newItems);
                          }}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>---</TableCell>
                    <TableCell>---</TableCell>
                    <TableCell>---</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {error && <Typography color="error">{error}</Typography>}
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 2 }}
            >
              <Button
                variant="outlined"
                onClick={() => setOpenModal(true)}
                disabled={!proveedorId}
              >
                Agregar Item
              </Button>
            </Box>
            <Dialog
              open={openModal}
              onClose={() => setOpenModal(false)}
              PaperProps={{
                sx: {
                  width: "400px",
                  maxWidth: "100%",
                },
              }}
            >
              <DialogTitle>Agregar Nuevo Item</DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <FormControl key="stockId" fullWidth margin="normal">
                    <InputLabel>Stock</InputLabel>
                    <Select
                      label="Stock"
                      value={newItem.stockId}
                      onChange={(e) => {
                        const selectedOption = stockOptions.find(
                          (option) => option.id === e.target.value
                        );
                        setNewItem({
                          ...newItem,
                          stockId: Number(e.target.value),
                          stock: {
                            name: selectedOption
                              ? `${selectedOption.name} - ${selectedOption.label}`
                              : "",
                          },
                        });
                      }}
                      fullWidth
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === 0) {
                          return <em>Seleccionar elemento</em>;
                        }
                        return stockOptions.find(
                          (option) => option.id === selected
                        )?.name;
                      }}
                    >
                      <MenuItem disabled value={0}>
                        <em>Elemento</em>
                      </MenuItem>
                      {stockOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name} [{option.label}]
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  label="Unidades"
                  type="number"
                  value={newItem.cantidad}
                  fullWidth
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      cantidad: Number(e.target.value),
                    });
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ mr: 2, mb: 2 }}>
                <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    const newItems = [...items, newItem];
                    setItems(newItems);
                    onChange(newItems);
                    setOpenModal(false);
                    setNewItem({
                      id: "",
                      stockId: 0,
                      stock: { name: "" },
                      cantidad: null,
                    });
                  }}
                  variant="contained"
                  disabled={newItem.stockId === 0 || newItem.cantidad === null}
                >
                  Agregar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      },
    },
    { name: "precioTotal", label: "Precio Total", type: "number" },
  ];

  const createNewOrdenDeCompra = (): OrdenDeCompra => {
    return {
      id: "",
      fecha: new Date().toISOString().split("T")[0],
      precioTotal: null,
      proveedorId: null,
      proveedor: {
        name: "",
      },
      items: [],
    };
  };

  return (
    <CrudTable<OrdenDeCompra>
      title="Órdenes de Compra"
      columns={columns}
      apiEndpoint="/api/orden-de-compra"
      fields={formFields}
      createNewItem={createNewOrdenDeCompra}
      validationSchema={yup.object({
        fecha: yup.date().required("La fecha es requerida"),
        precioTotal: yup.number().required("El precio total es requerido"),
        proveedorId: yup.number().required("El proveedor es requerido"),
        items: yup.array().min(1, "Debe agregar al menos un item"),
      })}
    />
  );
};

export default OrdenDeCompraPage;
