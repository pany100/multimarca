"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface CategoriaGasto {
  id: string;
  nombre: string;
}

const CategoriasGastoPage = () => {
  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 2 },
  ];

  const formFields: FieldConfig[] = [
    { name: "nombre", label: "Nombre", type: "text" },
  ];

  const createNewCategoriaGasto = (): CategoriaGasto => {
    return {
      id: "",
      nombre: "",
    };
  };

  return (
    <CrudTable<CategoriaGasto>
      title="Categorías de Gasto"
      columns={columns}
      apiEndpoint="/api/categorias-gasto"
      fields={formFields}
      createNewItem={createNewCategoriaGasto}
      validationSchema={yup.object({
        nombre: yup.string().required("El nombre es requerido"),
      })}
      nonEditableItems={[1, 2, 3]}
    />
  );
};

export default CategoriasGastoPage;
