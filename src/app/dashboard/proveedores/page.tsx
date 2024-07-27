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
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    { field: "mobile", headerName: "Móvil", flex: 1 },
    { field: "cuit", headerName: "CUIT", flex: 1 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text", layout: { xs: 12 } },
    { name: "address", label: "Dirección", type: "text", layout: { xs: 6 } },
    { name: "email", label: "Email", type: "email", layout: { xs: 6 } },
    { name: "phone", label: "Teléfono", type: "tel", layout: { xs: 6 } },
    { name: "mobile", label: "Móvil", type: "tel", layout: { xs: 6 } },
    { name: "iva", label: "IVA", type: "text", layout: { xs: 6 } },
    { name: "cuit", label: "CUIT", type: "text", layout: { xs: 6 } },
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
