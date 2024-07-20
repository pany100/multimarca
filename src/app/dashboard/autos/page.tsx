"use client";

import CrudTable from "@/components/CrudTable";
import DynamicForm, { FieldConfig } from "@/components/DynamicForm";

interface Auto {
  id: string;
  patent: string;
  model: string | null;
  brand: string | null;
  color: string | null;
  year: number | null;
  kms: number | null;
  valves: number | null;
  ownerId: number;
  chassis_number: string | null;
  engine_number: string | null;
  observations: string | null;
  transmission_type: string | null;
}

const AutosPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "patent", headerName: "Patente", width: 120 },
    { field: "brand", headerName: "Marca", width: 120 },
    { field: "model", headerName: "Modelo", width: 120 },
    { field: "year", headerName: "Año", width: 80 },
    { field: "color", headerName: "Color", width: 100 },
    { field: "kms", headerName: "Kilómetros", width: 100 },
    {
      field: "owner",
      headerName: "Propietario",
      width: 200,
      renderCell: (params: any) => params.row.owner.fullName,
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "patent", label: "Patente", type: "text" },
    { name: "brand", label: "Marca", type: "text" },
    { name: "model", label: "Modelo", type: "text" },
    { name: "year", label: "Año", type: "number" },
    { name: "color", label: "Color", type: "text" },
    { name: "kms", label: "Kilómetros", type: "number" },
    { name: "valves", label: "Válvulas", type: "number" },
    {
      name: "ownerId",
      label: "Propietario",
      type: "autocomplete",
      relatedObjectName: "owner",
      relatedObjectIdField: "id",
      relatedObjectLabelField: "fullName",
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/clientes?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((cliente: { fullName: any; id: any }) => ({
          label: cliente.fullName,
          value: cliente.id,
        }));
      },
    },
    { name: "chassis_number", label: "Número de Chasis", type: "text" },
    { name: "engine_number", label: "Número de Motor", type: "text" },
    { name: "observations", label: "Observaciones", type: "text" },
    { name: "transmission_type", label: "Tipo de Transmisión", type: "text" },
  ];

  const renderEditForm = (
    auto: Auto | null,
    handleChange: (field: keyof Auto, value: any) => void
  ) => (
    <DynamicForm<Auto>
      item={auto}
      fields={formFields}
      handleChange={handleChange}
    />
  );

  const createNewAuto = (): Auto => {
    return {
      id: "",
      patent: "",
      model: null,
      brand: null,
      color: null,
      year: null,
      kms: null,
      valves: null,
      ownerId: 0,
      chassis_number: null,
      engine_number: null,
      observations: null,
      transmission_type: null,
    };
  };

  return (
    <CrudTable<Auto>
      title="Gestión de Autos"
      columns={columns}
      apiEndpoint="/api/autos"
      renderEditForm={renderEditForm}
      createNewItem={createNewAuto}
    />
  );
};

export default AutosPage;
