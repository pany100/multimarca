"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
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
  const initializedRef = useRef(false);
  const { authFetch } = useFetch();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Descripción", flex: 1.5 },
    { field: "precio", headerName: "Monto", flex: 1 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-ES"),
    },
    {
      field: "categoria",
      headerName: "Categoría",
      flex: 1.5,
      valueGetter: (categoria: any) => categoria?.nombre || "",
    },
    {
      field: "mecanico",
      headerName: "Mecánico",
      flex: 1,
      valueGetter: (mecanico: any) => mecanico?.name || "-",
    },
    {
      field: "ordenDeCompra",
      headerName: "Orden de Compra",
      flex: 2.5,
      valueGetter: (ordenDeCompra: any) => {
        return ordenDeCompra
          ? `Proveedor: ${ordenDeCompra?.proveedor.name} - Orden: #${
              ordenDeCompra?.id
            } - Fecha: ${new Date(ordenDeCompra?.fecha).toLocaleDateString(
              "es-ES",
              { day: "numeric", month: "long", year: "numeric" }
            )}`
          : "-";
      },
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
        const response = await authFetch(
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
        const response = await authFetch(
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
        const response = await authFetch(
          `/api/proveedores?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((proveedor: { name: any; id: any }) => ({
          label: proveedor.name,
          value: proveedor.id,
        }));
      },
      getInitialValue: (gasto: Gasto) => {
        return {
          value: gasto.ordenDeCompra?.proveedor.id || "",
          label: gasto.ordenDeCompra?.proveedor.name || "",
        };
      },
      hidden: (gasto: Gasto) => gasto.categoriaId !== 1,
      onChange: async (
        value: number | null,
        setValue: UseFormSetValue<any>
      ) => {
        initializedRef.current = true;
        if (value) {
          const response = await authFetch(
            `/api/proveedores/${value}/orden-de-compra`
          );
          const data = await response.json();
          const customOptions = data.map(
            (order: { id: number; fecha: string; deuda: number }) => ({
              value: order.id,
              label: `ID: ${order.id} - ${new Date(
                order.fecha
              ).toLocaleDateString("es-AR")} - Deuda: $${order.deuda.toFixed(
                2
              )}`,
            })
          );
          setValue("ordenDeCompraId", null);
          setOptions(customOptions);
        } else {
          setValue("ordenDeCompraId", null);
          setOptions([]);
        }
      },
    },
    {
      name: "ordenDeCompraId",
      label: "Orden de Compra",
      type: "select",
      hidden: (gasto: Gasto) => gasto.categoriaId !== 1,
      options: (gasto: Gasto) => {
        if (gasto.ordenDeCompraId && !initializedRef.current) {
          const init = [
            {
              value: gasto.ordenDeCompra?.id || 0,
              label: `ID: ${gasto.ordenDeCompra?.id} - ${new Date(
                gasto.ordenDeCompra?.fecha || ""
              ).toLocaleDateString("es-AR")}`,
            },
          ];
          return init;
        }
        return options;
      },
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
        mecanicoId: yup.number().when("categoriaId", ([categoriaId]) => {
          return categoriaId === 2
            ? yup
                .number()
                .required("El mecánico es requerido para esta categoría")
            : yup.number().nullable();
        }),
        ordenDeCompraId: yup.number().when("categoriaId", ([categoriaId]) => {
          return categoriaId === 1
            ? yup
                .number()
                .required(
                  "La orden de compra es requerida para Pago Proveedores"
                )
            : yup.number().nullable();
        }),
      })}
    />
  );
};

export default GastosPage;
