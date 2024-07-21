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
        const isLastItemComplete = () => {
          if (items.length === 0) return true;
          const lastItem = items[items.length - 1];
          return lastItem.stockId !== 0 && lastItem.cantidad !== 0;
        };

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
              disabled={!isLastItemComplete()}
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
