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
  email: string;
  phone: string;
  birthday: string;
}

const MecanicosPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre", width: 150 },
    { field: "dni", headerName: "DNI", width: 120 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Teléfono", width: 150 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text" },
    { name: "start_date", label: "Fecha de comienzo", type: "date" },
    { name: "dni", label: "DNI", type: "text" },
    { name: "address", label: "Dirección", type: "text" },
    { name: "city", label: "Ciudad", type: "text" },
    { name: "state", label: "Provincia", type: "text" },
    { name: "postal_code", label: "Código Postal", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Teléfono", type: "tel" },
    { name: "birthday", label: "Fecha de Nacimiento", type: "date" },
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
      phone: "",
      birthday: "",
    };
  };

  return (
    <CrudTable<Mecanico>
      title="Mecánicos"
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
