"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface Mecanico {
  id: string;
  start_date: string;
  name: string;
  dni: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  tipo: string;
  email: string;
  phone: string;
  birthday: string;
}

const MecanicosPage = () => {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "start_date",
      headerName: "Fecha de comienzo",
      flex: 1,
      valueGetter: (start_date: string) => {
        return new Date(start_date).toLocaleDateString("es-ES");
      },
    },
    { field: "dni", headerName: "DNI", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "tipo", headerName: "Tipo", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text", layout: { xs: 6 } },
    { name: "email", label: "Email", type: "email", layout: { xs: 6 } },
    {
      name: "start_date",
      label: "Fecha de comienzo",
      type: "date",
      layout: { xs: 4 },
    },
    {
      name: "birthday",
      label: "Fecha de Nacimiento",
      type: "date",
      layout: { xs: 4 },
    },
    { name: "dni", label: "DNI", type: "text", layout: { xs: 4 } },
    { name: "address", label: "Dirección", type: "text", layout: { xs: 6 } },
    { name: "state", label: "Provincia", type: "text", layout: { xs: 6 } },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Mecanico", label: "Mecánico" },
        { value: "Administrativo", label: "Administrativo" },
      ],
      layout: { xs: 6 },
    },
    {
      name: "postal_code",
      label: "Código Postal",
      type: "text",
      layout: { xs: 6 },
    },
    { name: "phone", label: "Teléfono", type: "tel", layout: { xs: 6 } },
    { name: "city", label: "Ciudad", type: "text", layout: { xs: 6 } },
  ];

  const createNewMecanico = (): Mecanico => {
    return {
      id: "",
      start_date: "",
      name: "",
      dni: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      email: "",
      tipo: "Mecanico",
      phone: "",
      birthday: "",
    };
  };

  return (
    <CrudTable<Mecanico>
      title="Empleados"
      columns={columns}
      apiEndpoint="/api/mecanicos"
      fields={formFields}
      createNewItem={createNewMecanico}
      validationSchema={yup.object({
        name: yup.string().required("El nombre es requerido"),
        dni: yup
          .string()
          .matches(/^\d+$/, "El DNI debe contener solo nmeros")
          .nullable(),
        email: yup.string().email("El email es inválido").nullable(),
        phone: yup.string().nullable(),
      })}
    />
  );
};

export default MecanicosPage;
