"use client";

import CrudTable from "@/components/CrudTable";
import DynamicForm, { FieldConfig } from "@/components/DynamicForm";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Button,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

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

const OrdenDeCompraPage = () => {
  const [items, setItems] = useState<OrdenDeCompra["items"]>([]);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [stockOptions, setStockOptions] = useState<
    Array<Array<{ id: number; name: string }>>
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
  ];

  const searchStock = async (query: string, index: number) => {
    if (proveedorId) {
      const response = await fetch(
        `/api/proveedores/${proveedorId}/stock?query=${query}&page=0&size=10`
      );
      const data = await response.json();
      const results = data.items.map((stock: { name: string; id: number }) => ({
        id: stock.id,
        name: stock.name,
      }));
      setStockOptions((prev) => {
        const newOptions = [...prev];
        newOptions[index] = results;
        return newOptions;
      });
    }
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
      getInitialValue: (ordenDeCompra: OrdenDeCompra) => ({
        value: ordenDeCompra.proveedorId,
        label: ordenDeCompra.proveedor?.name || "",
      }),
      onChange: (value: { value: number; label: string }) => {
        setProveedorId(value.value);
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
            {items.map((item, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={5}>
                  <Autocomplete
                    options={stockOptions[index] || []}
                    getOptionLabel={(option: { name: string; id: number }) =>
                      option.name
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Stock" />
                    )}
                    value={item.stock}
                    onChange={(_, newValue) => {
                      const newItems = [...items];
                      newItems[index].stockId = newValue?.id ?? 0;
                      newItems[index].stock = newValue ?? { id: 0, name: "" };
                      setItems(newItems);
                      onChange(newItems);
                    }}
                    onInputChange={(_, newInputValue) => {
                      searchStock(newInputValue, index);
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Unidades"
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].cantidad = Number(e.target.value);
                      setItems(newItems);
                      onChange(newItems);
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== index);
                      setItems(newItems);
                      onChange(newItems);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="contained"
              onClick={() => {
                const newItems = [
                  ...items,
                  {
                    id: "",
                    stockId: 0,
                    stock: { id: 0, name: "" },
                    cantidad: 0,
                  },
                ];
                setItems(newItems);
                onChange(newItems);
              }}
            >
              Agregar Item
            </Button>
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
