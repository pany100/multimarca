"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import CedulaVerdeModal from "@/components/UploadImageModal";
import { useFetch } from "@/contexts/FetchContext";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, IconButton, Snackbar, Tooltip } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const { authFetch } = useFetch();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "patent", headerName: "Patente", flex: 0.7 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1.5 },
    { field: "year", headerName: "Año", flex: 0.5 },
    { field: "color", headerName: "Color", flex: 0.7 },
    { field: "kms", headerName: "Kilómetros", flex: 0.7 },
    {
      field: "owner",
      headerName: "Propietario",
      flex: 2,
      renderCell: (params: any) => params.row.owner.fullName,
    },
    {
      field: "cedulaVerdePath",
      headerName: "Cédula Verde",
      flex: 0.7,
      renderCell: (params: any) =>
        params.row.cedulaVerdePath ? (
          <Image
            src={params.row.cedulaVerdePath}
            alt="Cédula Verde"
            width={100}
            height={50}
          />
        ) : (
          "-"
        ),
    },
  ];

  const formFields: FieldConfig[] = [
    {
      name: "patent",
      label: "Patente",
      type: "text",
      layout: {
        xs: 4,
      },
    },
    {
      name: "brand",
      label: "Marca",
      type: "text",
      layout: {
        xs: 4,
      },
    },
    {
      name: "model",
      label: "Modelo",
      type: "text",
      layout: {
        xs: 4,
      },
    },
    {
      name: "year",
      label: "Año",
      type: "number",
      layout: {
        xs: 4,
      },
    },
    {
      name: "color",
      label: "Color",
      type: "text",
      layout: {
        xs: 4,
      },
    },
    {
      name: "kms",
      label: "Kilómetros",
      type: "number",
      layout: {
        xs: 4,
      },
    },
    {
      name: "valves",
      label: "Válvulas",
      type: "number",
      layout: {
        xs: 6,
      },
    },
    {
      name: "ownerId",
      label: "Propietario",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
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
      layout: {
        xs: 6,
      },
    },
    {
      name: "chassis_number",
      label: "Número de Chasis",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "engine_number",
      label: "Número de Motor",
      type: "text",
      layout: {
        xs: 6,
      },
    },
    {
      name: "transmission_type",
      label: "Tipo de Transmisión",
      type: "select",
      options: [
        { value: "Automático", label: "Automático" },
        { value: "Manual", label: "Manual" },
      ],
    },
    { name: "observations", label: "Observaciones", type: "text" },
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
    <>
      <Tooltip title="Ver detalles">
        <IconButton
          onClick={() => router.push(`/dashboard/autos/${auto.id}/ver`)}
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Agregar cédula de identificación automotor">
        <IconButton onClick={() => handleExtraAction(auto)} size="small">
          <DirectionsCarIcon />
        </IconButton>
      </Tooltip>
    </>
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

        const response = await authFetch(
          `/api/autos/${selectedAuto.id}/cedula`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Error al guardar la cédula verde");
        }

        const updatedAuto = await response.json();
        console.log("Cédula verde guardada exitosamente", updatedAuto);

        setModalOpen(false);
        setSnackbar({
          open: true,
          message: "Cédula verde guardada exitosamente",
          severity: "success",
        });
      } catch (error) {
        console.error("Error al guardar la cédula verde:", error);
        setSnackbar({
          open: true,
          message: "Error al guardar la cédula verde",
          severity: "error",
        });
      }
    }
  };

  return (
    <>
      <CrudTable<Auto>
        title="Autos"
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
          title="Cédula de Indentificación"
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AutosPage;
