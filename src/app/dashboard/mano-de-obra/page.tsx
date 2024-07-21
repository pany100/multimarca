"use client";

import CrudTable from "@/components/CrudTable";
import DynamicForm, { FieldConfig } from "@/components/DynamicForm";

interface ManoDeObra {
  id: string;
  name: string;
  sellPrice: number;
}

const ManoDeObraPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre del Trabajo", width: 200 },
    { field: "sellPrice", headerName: "Precio de Venta", width: 150 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre del Trabajo", type: "text" },
    { name: "sellPrice", label: "Precio de Venta", type: "number" },
  ];

  const renderEditForm = (
    trabajo: ManoDeObra | null,
    handleChange: (field: keyof ManoDeObra, value: any) => void
  ) => (
    <DynamicForm<ManoDeObra>
      item={trabajo}
      fields={formFields}
      handleChange={handleChange}
    />
  );

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
      renderEditForm={renderEditForm}
      createNewItem={createNewTrabajo}
    />
  );
};

export default ManoDeObraPage;
