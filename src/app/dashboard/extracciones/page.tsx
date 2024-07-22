"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import authFetch from "@/utils/authFetch";
import { useEffect, useState } from "react";
import * as yup from "yup";

interface Extraccion {
  id: string;
  monto: number;
  fecha: string;
  usuarioId: number;
  usuario: {
    fullName: string;
  };
  motivo: string;
  tipoExtraccion: "EFECTIVO" | "TRANSFERENCIA";
}

const ExtraccionesPage = () => {
  const [usuarios, setUsuarios] = useState<{ value: number; label: string }[]>(
    []
  );
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await authFetch("/api/usuarios/admins");
        const data = await response.json();
        const customUsuarios = data.map(
          (usuario: { id: number; fullName: string }) => ({
            value: usuario.id,
            label: usuario.fullName,
          })
        );
        setUsuarios(customUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "monto", headerName: "Monto", width: 130 },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 180,
      renderCell: (value: any) => new Date(value.value).toLocaleDateString(),
    },
    {
      field: "usuario",
      headerName: "Usuario",
      width: 180,
      renderCell: (value: any) => value.value.fullName,
    },
    { field: "motivo", headerName: "Motivo", width: 250 },
    { field: "tipoExtraccion", headerName: "Tipo de Extracción", width: 180 },
  ];

  const formFields: FieldConfig[] = [
    { name: "monto", label: "Monto", type: "number" },
    { name: "fecha", label: "Fecha", type: "date" },
    {
      name: "usuarioId",
      label: "Usuario",
      type: "select",
      options: usuarios,
      getInitialValue(item: any) {
        const usuario = usuarios.find((u) => u.value === item.usuarioId);
        return {
          value: usuario ? usuario.value : "",
          label: usuario ? usuario.label : "",
        };
      },
    },
    { name: "motivo", label: "Motivo", type: "text" },
    {
      name: "tipoExtraccion",
      label: "Tipo de Extracción",
      type: "select",
      options: [
        { label: "Efectivo", value: "EFECTIVO" },
        { label: "Transferencia", value: "TRANSFERENCIA" },
      ],
    },
  ];

  const createNewExtraccion = (): Extraccion => {
    return {
      id: "",
      monto: 0,
      fecha: new Date().toISOString().split("T")[0],
      usuarioId: 0,
      usuario: {
        fullName: "",
      },
      motivo: "",
      tipoExtraccion: "EFECTIVO",
    };
  };

  return (
    <CrudTable<Extraccion>
      title="Extracciones"
      columns={columns}
      apiEndpoint="/api/extracciones"
      fields={formFields}
      createNewItem={createNewExtraccion}
      validationSchema={yup.object({
        monto: yup
          .number()
          .required("El monto es requerido")
          .positive("El monto debe ser positivo"),
        fecha: yup.date().required("La fecha es requerida"),
        usuarioId: yup.number().required("El usuario es requerido"),
        motivo: yup.string().required("El motivo es requerido"),
        tipoExtraccion: yup
          .string()
          .oneOf(["EFECTIVO", "TRANSFERENCIA"], "Tipo de extracción inválido")
          .required("El tipo de extracción es requerido"),
      })}
    />
  );
};

export default ExtraccionesPage;
