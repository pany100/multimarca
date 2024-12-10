"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface ControlMecanico {
  id: string;
  name: string;
  type: string;
  ordenEnPdf: number | null;
}

const ControlesMecanicosPage = () => {
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Control", flex: 1 },
    { field: "type", headerName: "Tipo", flex: 1 },
    {
      field: "pdfName",
      headerName: "Nombre para el detalle",
      flex: 1,
      renderCell: (params: any) => params.row.pdfName || params.row.name,
    },
    {
      field: "ordenEnPdf",
      headerName: "Orden en PDF",
      flex: 1,
      renderCell: (params: any) => params.value || "N/A",
    },
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
    { name: "pdfName", label: "Nombre para el detalle", type: "text" },
    { name: "ordenEnPdf", label: "Orden en PDF", type: "number" },
  ];

  const createNewControl = (): ControlMecanico => {
    return {
      id: "",
      name: "",
      type: "",
      ordenEnPdf: null,
    };
  };

  return (
    <CrudTable<ControlMecanico>
      title="Controles Mecánicos"
      columns={columns}
      apiEndpoint="/api/controles-mecanicos"
      fields={formFields}
      createNewItem={createNewControl}
      validationSchema={yup.object({
        name: yup.string().required("El nombre es requerido"),
        type: yup.string().required("El tipo es requerido"),
        pdfName: yup.string().nullable(),
        ordenEnPdf: yup.number().nullable(),
      })}
    />
  );
};

export default ControlesMecanicosPage;
