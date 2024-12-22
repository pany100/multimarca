"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
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
import { useState } from "react";
import * as yup from "yup";

interface Venta {
  id: string;
  fecha: string;
  total: number;
  clienteId: number;
  cliente: {
    fullName: string;
  };
  moneda: string;
  items: Array<{
    id: string;
    cantidad: number | null;
    stockId: number;
    stock: {
      id: number;
      name: string;
      price: number;
    };
  }>;
}

const VentasPage = () => {
  const [items, setItems] = useState<Venta["items"]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    id: string;
    stockId: number;
    stock: { id: number; name: string; price: number };
    cantidad: number | null;
  }>({
    id: "",
    stockId: 0,
    stock: { id: 0, name: "", price: 0 },
    cantidad: null,
  });
  const [stockOptions, setStockOptions] = useState<
    Array<{ id: number; name: string; price: number }>
  >([]);
  const { authFetch } = useFetch();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 0.8,
      valueGetter: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      valueGetter: (total: any) => getFormattedPrice(total),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      valueGetter: (cliente: any) => cliente?.fullName || "",
      flex: 1.5,
    },
    {
      field: "detalle",
      headerName: "Detalle",
      flex: 1.5,
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
    const response = await authFetch(
      `/api/stock?query=${query}&page=0&size=10`
    );
    const data = await response.json();
    const results = data.items.map(
      (stock: { name: string; id: number; price: number }) => ({
        id: stock.id,
        name: stock.name,
        price: stock.price,
      })
    );
    setStockOptions(results);
  };

  const formFields: FieldConfig[] = [
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      layout: {
        xs: 6,
      },
    },

    {
      name: "clienteId",
      label: "Cliente",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
          `/api/clientes?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((cliente: { fullName: any; id: any }) => ({
          label: cliente.fullName,
          value: cliente.id,
        }));
      },
      getInitialValue: (venta: Venta) => ({
        value: venta.clienteId,
        label: venta.cliente?.fullName || "",
      }),
      layout: {
        xs: 6,
      },
    },
    {
      name: "items",
      label: "Items",
      type: "custom",
      render: (value, onChange, error) => {
        const currentItems = (value as Venta["items"]) || [];
        setItems(currentItems);
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
                  items.map((item) => (
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
                  ))
                ) : (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
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
              <Button variant="contained" onClick={() => setOpenModal(true)}>
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
                <Box sx={{ mb: 3, mt: 1 }}>
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
                        stock: newValue ?? { id: 0, name: "", price: 0 },
                      });
                    }}
                    onInputChange={(_, newInputValue) => {
                      searchStock(newInputValue);
                    }}
                  />
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
                      stock: { id: 0, name: "", price: 0 },
                      cantidad: null,
                    });
                  }}
                  disabled={newItem.stockId === 0 || !newItem.cantidad}
                >
                  Agregar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      },
    },
    {
      name: "moneda",
      label: "Moneda",
      type: "select",
      options: [
        { label: "Dolar", value: "Dolar" },
        { label: "Peso", value: "Peso" },
      ],
    },
    {
      name: "total",
      label: "Total",
      type: "number",
      layout: {
        xs: 12,
      },
    },
  ];

  const createNewVenta = (): Venta => {
    return {
      id: "",
      fecha: new Date().toISOString().split("T")[0],
      moneda: "Peso",
      total: 0,
      clienteId: 0,
      cliente: {
        fullName: "",
      },
      items: [],
    };
  };

  return (
    <CrudTable<Venta>
      title="Ventas"
      columns={columns}
      apiEndpoint="/api/ventas"
      fields={formFields}
      createNewItem={createNewVenta}
      validationSchema={yup.object({
        fecha: yup.date().required("La fecha es requerida"),
        moneda: yup.string().required("La moneda es requerida"),
        total: yup.number().required("El total es requerido"),
        clienteId: yup.number().required("El cliente es requerido"),
        items: yup.array().min(1, "Debe agregar al menos un item"),
      })}
    />
  );
};

export default VentasPage;
