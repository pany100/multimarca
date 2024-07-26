"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface IngresoPorReparacion {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string;
  clienteId: number;
  cliente: {
    fullName: string;
  };
  ordenReparacionId: number;
  ordenReparacion: {
    id: number;
    auto: {
      patent: string;
      brand: string;
      model: string;
    };
  };
}

const IngresosPorReparacionPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fecha", headerName: "Fecha", width: 120 },
    { field: "monto", headerName: "Monto", width: 100 },
    { field: "descripcion", headerName: "Descripción", width: 200 },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 150,
      valueGetter: (cliente: any) => cliente?.fullName || "",
    },
    {
      field: "ordenReparacion",
      headerName: "Orden de Reparación",
      width: 200,
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${ordenReparacion.auto.brand} ${ordenReparacion.auto.model}`,
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "fecha", label: "Fecha", type: "date" },
    { name: "monto", label: "Monto", type: "number" },
    { name: "descripcion", label: "Descripción", type: "text" },
    {
      name: "clienteId",
      label: "Cliente",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/clientes?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((cliente: { fullName: string; id: number }) => ({
          label: cliente.fullName,
          value: cliente.id,
        }));
      },
    },
    {
      name: "ordenReparacionId",
      label: "Orden de Reparación",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/orden-reparacion?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map(
          (orden: {
            id: number;
            auto: { patent: string; brand: string; model: string };
          }) => ({
            label: `#${orden.id} - ${orden.auto.patent} ${orden.auto.brand} ${orden.auto.model}`,
            value: orden.id,
          })
        );
      },
    },
  ];

  const createNewIngresoPorReparacion = (): IngresoPorReparacion => {
    return {
      id: "",
      fecha: new Date().toISOString().split("T")[0],
      monto: 0,
      descripcion: "",
      clienteId: 0,
      cliente: {
        fullName: "",
      },
      ordenReparacionId: 0,
      ordenReparacion: {
        id: 0,
        auto: {
          patent: "",
          brand: "",
          model: "",
        },
      },
    };
  };

  return (
    <CrudTable<IngresoPorReparacion>
      title="Ingresos por Reparación"
      columns={columns}
      apiEndpoint="/api/ingresos-reparacion"
      fields={formFields}
      createNewItem={createNewIngresoPorReparacion}
      validationSchema={yup.object({
        fecha: yup.date().required("La fecha es requerida"),
        monto: yup
          .number()
          .required("El monto es requerido")
          .positive("El monto debe ser positivo"),
        descripcion: yup.string().required("La descripción es requerida"),
        clienteId: yup.number().required("El cliente es requerido"),
        ordenReparacionId: yup
          .number()
          .required("La orden de reparación es requerida"),
      })}
    />
  );
};

export default IngresosPorReparacionPage;
