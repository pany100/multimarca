"use client";

import CedulaVerdeModal from "@/components/CedulaVerdeModal";
import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import * as yup from "yup";

interface Auto {
  owner?: {
    id: string;
    fullName: string;
  };
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);

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
      getInitialValue: (auto: Auto) => ({
        value: auto.owner?.id || auto.ownerId,
        label: auto.owner?.fullName || "",
      }),
    },
    { name: "chassis_number", label: "Número de Chasis", type: "text" },
    { name: "engine_number", label: "Número de Motor", type: "text" },
    { name: "observations", label: "Observaciones", type: "text" },
    { name: "transmission_type", label: "Tipo de Transmisión", type: "text" },
  ];

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

  const extraActions = (auto: Auto) => (
    <Tooltip title="Agregar cédula verde">
      <IconButton onClick={() => handleExtraAction(auto)} size="small">
        <DirectionsCarIcon />
      </IconButton>
    </Tooltip>
  );

  const handleExtraAction = (auto: Auto) => {
    setSelectedAuto(auto);
    setModalOpen(true);
  };

  const handleSaveCedulaVerde = async (file: File | null) => {
    if (file && selectedAuto) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/autos/${selectedAuto.id}/cedula`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al guardar la cédula verde");
        }

        const updatedAuto = await response.json();
        console.log("Cédula verde guardada exitosamente", updatedAuto);

        setModalOpen(false);
      } catch (error) {
        console.error("Error al guardar la cédula verde:", error);
      }
    }
  };

  return (
    <>
      <CrudTable<Auto>
        title="Gestión de Autos"
        columns={columns}
        apiEndpoint="/api/autos"
        fields={formFields}
        createNewItem={createNewAuto}
        extraActions={extraActions}
        validationSchema={yup.object({
          patent: yup.string().required("La patente es requerida"),
          brand: yup.string().required("La marca es requerida"),
          model: yup.string().required("El modelo es requerido"),
          year: yup.number().required("El año es requerido"),
          color: yup.string().required("El color es requerido"),
          kms: yup.number().required("Los kilómetros son requeridos"),
          ownerId: yup.number().required("El propietario es requerido"),
        })}
      />
      {selectedAuto && (
        <CedulaVerdeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveCedulaVerde}
          patente={selectedAuto.patent}
        />
      )}
    </>
  );
};

export default AutosPage;
