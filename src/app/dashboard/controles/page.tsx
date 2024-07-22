"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";

interface ControlMecanico {
  id: string;
  name: string;
  type: string;
}

const ControlesMecanicosPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre del Control", width: 200 },
    { field: "type", headerName: "Tipo", width: 150 },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre del Control", type: "text" },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: [
        { value: "texto", label: "Texto" },
        { value: "checkbox", label: "Checkbox" },
      ],
    },
  ];

  const createNewControl = (): ControlMecanico => {
    return {
      id: "",
      name: "",
      type: "",
    };
  };

  return (
    <CrudTable<ControlMecanico>
      title="Controles Mecánicos"
      columns={columns}
      apiEndpoint="/api/controles-mecanicos"
      fields={formFields}
      createNewItem={createNewControl}
    />
  );
};

export default ControlesMecanicosPage;
