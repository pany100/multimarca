"use client";

import CrudTable from "@/components/CrudTable";
import DynamicForm, { FieldConfig } from "@/components/DynamicForm";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import * as Yup from "yup";

interface OrdenDeCompra {
  id: string;
  fecha: string;
  precioTotal: number;
  proveedorId: number;
  proveedor: {
    name: string;
  };
  items: Array<{
    id: string;
    cantidad: number;
    stockId: number;
    stock: {
      id: number; // Añadir esta línea
      name: string;
    };
  }>;
}

const ordenDeCompraSchema = Yup.object().shape({
  fecha: Yup.date().required("La fecha es requerida"),
  precioTotal: Yup.number()
    .positive("El precio total debe ser mayor a 0")
    .required("El precio total es requerido"),
  proveedorId: Yup.number()
    .positive("Debe seleccionar un proveedor")
    .required("El proveedor es requerido"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        stockId: Yup.number()
          .positive("Debe seleccionar un stock")
          .required("El stock es requerido"),
        cantidad: Yup.number()
          .positive("La cantidad debe ser mayor a 0")
          .required("La cantidad es requerida"),
      })
    )
    .min(1, "Debe agregar al menos un item"),
});

const OrdenDeCompraPage = () => {
  const [items, setItems] = useState<OrdenDeCompra["items"]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [newItem, setNewItem] = useState({
    id: "",
    stockId: 0,
    stock: { id: 0, name: "" },
    cantidad: 0,
  });
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [stockOptions, setStockOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);

  useEffect(() => {
    setItems([]);
  }, [proveedorId]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fecha", headerName: "Fecha", width: 200 },
    { field: "precioTotal", headerName: "Precio Total", width: 150 },
    {
      field: "proveedor",
      headerName: "Proveedor",
      width: 200,
      valueGetter: (proveedor: any) => proveedor?.name || "",
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
    },
  ];

  const searchStock = async (query: string) => {
    if (proveedorId) {
      const response = await fetch(
        `/api/proveedores/${proveedorId}/stock?query=${query}&page=0&size=10`
      );
      const data = await response.json();
      const results = data.items.map((stock: { name: string; id: number }) => ({
        id: stock.id,
        name: stock.name,
      }));
      setStockOptions(results);
    }
  };

  const validateItems = (items: OrdenDeCompra["items"]) => {
    if (items.length === 0) return "Debe agregar al menos un item";
    for (const item of items) {
      if (item.stockId === 0 || item.cantidad === 0) {
        return "Todos los items deben tener stock y cantidad";
      }
    }
    return null;
  };

  const formFields: FieldConfig[] = [
    { name: "fecha", label: "Fecha", type: "date" },
    { name: "precioTotal", label: "Precio Total", type: "number" },
    {
      name: "proveedorId",
      label: "Proveedor",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await fetch(
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
      onChange: (value: { value: number; label: string } | null) => {
        setProveedorId(value?.value ?? null);
      },
    },
    {
      name: "items",
      label: "Items",
      type: "custom",
      render: (value, onChange) => {
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
                {items.map((item) => (
                  <TableRow key={item.id}>
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
                ))}
              </TableBody>
            </Table>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              disabled={proveedorId === 0}
            >
              Agregar Item
            </Button>
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
              <DialogTitle>Agregar Nuevo Item</DialogTitle>
              <DialogContent>
                <Autocomplete
                  options={stockOptions || []}
                  getOptionLabel={(option: { name: string; id: number }) =>
                    option.name
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Stock" />
                  )}
                  value={newItem.stock}
                  onChange={(_, newValue) => {
                    setNewItem({
                      ...newItem,
                      stockId: newValue?.id ?? 0,
                      stock: newValue ?? { id: 0, name: "" },
                    });
                  }}
                  onInputChange={(_, newInputValue) => {
                    searchStock(newInputValue);
                  }}
                />
                <TextField
                  label="Unidades"
                  type="number"
                  value={newItem.cantidad}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      cantidad: Number(e.target.value),
                    });
                  }}
                />
              </DialogContent>
              <DialogActions>
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
                      stock: { id: 0, name: "" },
                      cantidad: 0,
                    });
                  }}
                  disabled={newItem.stockId === 0 || newItem.cantidad === 0}
                >
                  Agregar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      },
    },
  ];

  const renderEditForm = (
    ordenDeCompra: OrdenDeCompra | null,
    handleChange: (field: keyof OrdenDeCompra, value: any) => void
  ) => (
    <DynamicForm<OrdenDeCompra>
      item={ordenDeCompra}
      fields={formFields}
      handleChange={handleChange}
    />
  );

  const createNewOrdenDeCompra = (): OrdenDeCompra => {
    return {
      id: "",
      fecha: new Date().toISOString().split("T")[0],
      precioTotal: 0,
      proveedorId: 0,
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
      renderEditForm={renderEditForm}
      createNewItem={createNewOrdenDeCompra}
    />
  );
};

export default OrdenDeCompraPage;
