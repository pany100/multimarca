"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
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
  proveedorId?: number;
  proveedor?: {
    id: number;
    name: string;
  };
}

const GastosPage = () => {
  const { authFetch } = useFetch();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "nombre", headerName: "Descripción", flex: 1.5 },
    { field: "detalle", headerName: "Detalle", flex: 1.5 },
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
      field: "proveedor",
      headerName: "Proveedor",
      flex: 2.5,
      valueGetter: (proveedor: any) => {
        return proveedor?.name || "-";
      },
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "precio", label: "Monto", type: "number" },
    { name: "fecha", label: "Fecha", type: "date" },
    { name: "detalle", label: "Detalle", type: "textarea" },
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
          `/api/mecanicos?mecanicos=true&query=${query}&limit=10&page=0`
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
      getInitialValue: (gasto: Gasto) => {
        return {
          value: gasto.proveedor?.id || "",
          label: gasto.proveedor?.name || "",
        };
      },
      hidden: (gasto: Gasto) => gasto.categoriaId !== 1,
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
        proveedorId: yup.number().when("categoriaId", ([categoriaId]) => {
          return categoriaId === 1
            ? yup
                .number()
                .required("El proveedor es requerido para Pago Proveedores")
            : yup.number().nullable();
        }),
      })}
    />
  );
};

export default GastosPage;
