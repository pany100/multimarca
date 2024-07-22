"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface Proveedor {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  mobile: string;
  iva: string;
  cuit: string;
}

const ProveedoresPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "address", headerName: "Dirección", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Teléfono", width: 150 },
    { field: "mobile", headerName: "Móvil", width: 150 },
    { field: "iva", headerName: "IVA", width: 100 },
    { field: "cuit", headerName: "CUIT", width: 150 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text" },
    { name: "address", label: "Dirección", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Teléfono", type: "tel" },
    { name: "mobile", label: "Móvil", type: "tel" },
    { name: "iva", label: "IVA", type: "text" },
    { name: "cuit", label: "CUIT", type: "text" },
  ];

  const createNewProveedor = (): Proveedor => {
    return {
      id: "",
      name: "",
      address: "",
      email: "",
      phone: "",
      mobile: "",
      iva: "",
      cuit: "",
    };
  };

  return (
    <CrudTable<Proveedor>
      title="Proveedores"
      columns={columns}
      apiEndpoint="/api/proveedores"
      fields={formFields}
      createNewItem={createNewProveedor}
      validationSchema={yup.object({
        name: yup.string().required("El nombre es requerido"),
        address: yup.string().nullable(),
        email: yup.string().email("El email es inválido").nullable(),
        phone: yup.string().nullable(),
        mobile: yup.string().nullable(),
      })}
    />
  );
};

export default ProveedoresPage;
