"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
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
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    []
  );
  const initializedRef = useRef(false);
  const { authFetch } = useFetch();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    { field: "monto", headerName: "Monto", flex: 1 },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 150,
      valueGetter: (cliente: any) => cliente?.fullName || "",
      flex: 1.5,
    },
    {
      field: "ordenReparacion",
      headerName: "Orden de Reparación",
      width: 200,
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${
          ordenReparacion.auto.brand
        } ${ordenReparacion.auto.model}: ${
          ordenReparacion.fechaEntradaReparacion
            ? new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString("es-AR")
            : "Sin Fecha de entrada"
        }`,
      flex: 2,
    },
  ];

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
      name: "monto",
      label: "Monto",
      type: "number",
      layout: {
        xs: 6,
      },
    },
    { name: "descripcion", label: "Descripción", type: "text" },
    {
      name: "clienteId",
      label: "Cliente",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
          `/api/clientes?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((cliente: { fullName: string; id: number }) => ({
          label: cliente.fullName,
          value: cliente.id,
        }));
      },
      getInitialValue: (ingreso: any) => {
        const value = {
          value: ingreso.cliente.id,
          label: ingreso.cliente.fullName,
        };
        return value;
      },
      onChange: async (
        value: number | null,
        setValue: UseFormSetValue<any>
      ) => {
        initializedRef.current = true;

        if (!value) {
          setValue("ordenReparacionId", null);
          return;
        }
        const response = await authFetch(
          `/api/clientes/${value}/orden-reparacion?limit=10&page=0`
        );
        const data = await response.json();
        setOptions(
          data.map(
            (orden: {
              id: number;
              auto: { patent: string; brand: string; model: string };
              fechaEntradaReparacion: string;
            }) => ({
              label: `#${orden.id} - ${orden.auto.patent} ${orden.auto.brand} ${
                orden.auto.model
              } - ${
                orden.fechaEntradaReparacion
                  ? new Date(orden.fechaEntradaReparacion).toLocaleDateString()
                  : "-"
              }`,
              value: orden.id,
            })
          )
        );
        setValue("ordenReparacionId", null);
      },
    },
    {
      name: "ordenReparacionId",
      label: "Orden de Reparación",
      type: "select",
      options: (ingreso: any) => {
        if (ingreso.ordenReparacionId && !initializedRef.current) {
          const init = [
            {
              label: `#${ingreso.ordenReparacionId} - ${
                ingreso.ordenReparacion.auto.patent
              } ${ingreso.ordenReparacion.auto.brand} ${
                ingreso.ordenReparacion.auto.model
              } - ${
                ingreso.ordenReparacion.fechaEntradaReparacion
                  ? new Date(
                      ingreso.ordenReparacion.fechaEntradaReparacion
                    ).toLocaleDateString()
                  : "-"
              }`,
              value: ingreso.ordenReparacionId,
            },
          ];
          return init;
        }
        return options;
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
