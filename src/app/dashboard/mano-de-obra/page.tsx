"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface ManoDeObra {
  id: string;
  name: string;
  sellPrice: number;
}

const ManoDeObraPage = () => {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Trabajo", flex: 2 },
    { field: "sellPrice", headerName: "Precio de Venta", flex: 1 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre del Trabajo", type: "text" },
    { name: "sellPrice", label: "Precio de Venta", type: "number" },
  ];

  const createNewTrabajo = (): ManoDeObra => {
    return {
      id: "",
      name: "",
      sellPrice: 0,
    };
  };

  return (
    <CrudTable<ManoDeObra>
      title="Mano de Obra"
      columns={columns}
      apiEndpoint="/api/mano-de-obra"
      createNewItem={createNewTrabajo}
      fields={formFields}
      validationSchema={yup.object({
        name: yup.string().required("El nombre es requerido"),
        sellPrice: yup.number().required("El precio de venta es requerido"),
      })}
    />
  );
};

export default ManoDeObraPage;
