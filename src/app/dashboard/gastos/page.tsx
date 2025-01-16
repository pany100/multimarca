"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { getSchemaPropsForCheque } from "@/utils/chequeUtils";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { Chip } from "@mui/material";
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
  moneda: string;
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

    {
      field: "precio",
      headerName: "Monto",
      flex: 1,
      valueGetter: (precio: any) => getFormattedPrice(precio),
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
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO") {
          return "DEBITO AUTOMATICO";
        }
        if (params.value === "CHEQUE") {
          return (
            <a
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              CHEQUE
            </a>
          );
        }
        return params.value;
      },
    },
    { field: "detalle", headerName: "Detalle", flex: 1.5 },
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
      headerName: "Empleado",
      flex: 1,
      valueGetter: (mecanico: any) => mecanico?.name || "-",
    },
    {
      field: "proveedor",
      headerName: "Proveedor",
      flex: 1.5,
      valueGetter: (proveedor: any) => {
        return proveedor?.name || "-";
      },
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "nombre", label: "Nombre", type: "text" },
    {
      name: "precio",
      label: "Monto",
      type: "number",
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
      label: "Empleado",
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
    {
      name: "tipo",
      label: "Tipo de Operación",
      type: "select",
      options: [
        { label: "Efectivo", value: "EFECTIVO" },
        { label: "Transferencia", value: "TRANSFERENCIA" },
        { label: "Cheque", value: "CHEQUE" },
        {
          label: "Débito Automático tarjeta crédito",
          value: "DEBITO_AUTOMATICO_TARJETA_CREDITO",
        },
      ],
    },
    {
      type: "cheque",
      sourceField: "tipo",
      name: "cheque",
      label: "Cheque",
    },
  ];

  const createNewGasto = (): Gasto => {
    return {
      id: "",
      nombre: "",
      precio: 0,
      moneda: "Peso",
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
        moneda: yup.string().required("La moneda es requerida"),
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
        tipo: yup
          .string()
          .oneOf(
            [
              "EFECTIVO",
              "TRANSFERENCIA",
              "CHEQUE",
              "DEBITO_AUTOMATICO_TARJETA_CREDITO",
            ],
            "Tipo de extracción inválido"
          )
          .required("El tipo de extracción es requerido"),
        ...getSchemaPropsForCheque("tipo"),
      })}
    />
  );
};

export default GastosPage;
