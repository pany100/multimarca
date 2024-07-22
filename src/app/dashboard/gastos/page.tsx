"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useState } from "react";
import * as yup from "yup";

interface Gasto {
  id: string;
  nombre: string;
  precio: number;
  fecha: string;
  categoriaId: number;
  categoria: {
    id: number;
    nombre: string;
  };
  mecanicoId?: number;
  mecanico?: {
    id: number;
    name: string;
  };
  ordenDeCompraId?: number;
  ordenDeCompra?: {
    id: number;
    fecha: string;
    proveedorId: number;
    proveedor: {
      id: number;
      name: string;
    };
  };
}

const GastosPage = () => {
  const [options, setOptions] = useState([]);
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "precio", headerName: "Precio", width: 150 },
    { field: "fecha", headerName: "Fecha", width: 150 },
    {
      field: "categoria",
      headerName: "Categoría",
      width: 200,
      valueGetter: (categoria: any) => categoria?.nombre || "",
    },
    {
      field: "mecanico",
      headerName: "Mecánico",
      width: 200,
      valueGetter: (mecanico: any) => mecanico?.name || "",
    },
    {
      field: "ordenDeCompra",
      headerName: "Orden de Compra",
      width: 150,
      valueGetter: (ordenDeCompra: any) =>
        `Proveedor: ${ordenDeCompra?.proveedor.name} - Orden: #${
          ordenDeCompra?.id
        } - Fecha: ${new Date(ordenDeCompra?.fecha).toLocaleDateString(
          "es-ES",
          { day: "numeric", month: "long", year: "numeric" }
        )}`,
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "precio", label: "Precio", type: "number" },
    { name: "fecha", label: "Fecha", type: "date" },
    {
      name: "categoriaId",
      label: "Categoría",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/categorias-gasto?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((categoria: { nombre: string; id: number }) => ({
          label: categoria.nombre,
          value: categoria.id,
        }));
      },
      getInitialValue: (gasto: Gasto) => ({
        value: gasto.categoria?.id || "",
        label: gasto.categoria?.nombre || "",
      }),
    },
    {
      name: "mecanicoId",
      label: "Mecánico",
      type: "autocomplete",
      hidden: (gasto: Gasto) => gasto.categoriaId !== 2,
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/mecanicos?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((mecanico: { name: string; id: number }) => ({
          label: mecanico.name,
          value: mecanico.id,
        }));
      },
      getInitialValue: (gasto: Gasto) => ({
        value: gasto.mecanico?.id || "",
        label: gasto.mecanico?.name || "",
      }),
    },
    {
      name: "providerId",
      label: "Proveedor",
      type: "autocomplete",
      excludeFromSubmit: true,
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
      getInitialValue: (stock: Gasto) => {
        return {
          value: stock.ordenDeCompra?.proveedor.id || "",
          label: stock.ordenDeCompra?.proveedor.name || "",
        };
      },
      hidden: (gasto: Gasto) => gasto.categoriaId !== 1,
      onChange: async (value: number | null) => {
        if (value) {
          const response = await fetch(
            `/api/proveedores/${value}/orden-de-compra`
          );
          const data = await response.json();
          const customOptions = data.map(
            (order: { id: number; fecha: string; deuda: number }) => ({
              value: order.id,
              label: `ID: ${order.id} - ${
                order.fecha
              } - Deuda: $${order.deuda.toFixed(2)}`,
            })
          );
          setOptions(customOptions);
        }
      },
    },
    {
      name: "ordenDeCompraId",
      label: "Orden de Compra",
      type: "select",
      hidden: (gasto: Gasto) => gasto.categoriaId !== 1,
      options: options,
    },
  ];

  const createNewGasto = (): Gasto => {
    return {
      id: "",
      nombre: "",
      precio: 0,
      fecha: new Date().toISOString().split("T")[0],
      categoriaId: 0,
      categoria: {
        id: 0,
        nombre: "",
      },
    };
  };

  return (
    <CrudTable<Gasto>
      title="Gastos"
      columns={columns}
      apiEndpoint="/api/gastos"
      fields={formFields}
      createNewItem={createNewGasto}
      validationSchema={yup.object({
        nombre: yup.string().required("El nombre es requerido"),
        precio: yup
          .number()
          .required("El precio es requerido")
          .positive("El precio debe ser positivo"),
        fecha: yup.date().required("La fecha es requerida"),
        categoriaId: yup.number().required("La categoría es requerida"),
        mecanicoId: yup.number().nullable(),
        ordenDeCompraId: yup.number().nullable(),
      })}
    />
  );
};

export default GastosPage;
