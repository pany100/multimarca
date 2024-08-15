"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import UploadImageModal from "@/components/UploadImageModal";
import { useFetch } from "@/contexts/FetchContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, IconButton, Snackbar, Tooltip } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as yup from "yup";
interface Mecanico {
  id: string;
  start_date: string;
  name: string;
  dni: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  tipo: string;
  email: string;
  phone: string;
  birthday: string;
}

const MecanicosPage = () => {
  const router = useRouter();
  const [selectedEmpleado, setSelectedEmpleado] = useState<Mecanico | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authFetch } = useFetch();

  const handleExtraAction = (empleado: Mecanico) => {
    setSelectedEmpleado(empleado);
    setModalOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "start_date",
      headerName: "Fecha de comienzo",
      flex: 1,
      valueGetter: (start_date: string) => {
        return new Date(start_date).toLocaleDateString("es-ES");
      },
    },
    { field: "dni", headerName: "DNI", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "tipo", headerName: "Tipo", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "dniImagePath",
      headerName: "Foto DNI",
      flex: 0.7,
      renderCell: (params: any) =>
        params.row.dniImagePath ? (
          <Image
            src={params.row.dniImagePath}
            alt="DNI"
            width={100}
            height={50}
          />
        ) : (
          "-"
        ),
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text", layout: { xs: 6 } },
    { name: "email", label: "Email", type: "email", layout: { xs: 6 } },
    {
      name: "start_date",
      label: "Fecha de comienzo",
      type: "date",
      layout: { xs: 4 },
    },
    {
      name: "birthday",
      label: "Fecha de Nacimiento",
      type: "date",
      layout: { xs: 4 },
    },
    { name: "dni", label: "DNI", type: "text", layout: { xs: 4 } },
    { name: "address", label: "Dirección", type: "text", layout: { xs: 6 } },
    { name: "state", label: "Provincia", type: "text", layout: { xs: 6 } },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "Mecanico", label: "Mecánico" },
        { value: "Administrativo", label: "Administrativo" },
      ],
      layout: { xs: 6 },
    },
    {
      name: "postal_code",
      label: "Código Postal",
      type: "text",
      layout: { xs: 6 },
    },
    { name: "phone", label: "Teléfono", type: "tel", layout: { xs: 6 } },
    { name: "city", label: "Ciudad", type: "text", layout: { xs: 6 } },
  ];

  const createNewMecanico = (): Mecanico => {
    return {
      id: "",
      start_date: "",
      name: "",
      dni: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      email: "",
      tipo: "Mecanico",
      phone: "",
      birthday: "",
    };
  };

  const extraActions = (mecanico: Mecanico) => (
    <>
      <Tooltip title="Ver detalles">
        <IconButton
          onClick={() => router.push(`/dashboard/mecanicos/${mecanico.id}/ver`)}
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Agregar Foto DNI">
        <IconButton onClick={() => handleExtraAction(mecanico)} size="small">
          <CameraAltIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  const handleSaveDNIImage = async (file: File | null) => {
    if (file && selectedEmpleado) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await authFetch(
          `/api/mecanicos/${selectedEmpleado.id}/dni`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Error al guardar el dni");
        }

        const updatedAuto = await response.json();
        console.log("DNI guardado exitosamente", updatedAuto);

        setModalOpen(false);
        setSnackbar({
          open: true,
          message: "DNI guardado exitosamente",
          severity: "success",
        });
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error al guardar el dni:", error);
        setSnackbar({
          open: true,
          message: "Error al guardar el dni",
          severity: "error",
        });
      }
    }
  };

  return (
    <>
      <CrudTable<Mecanico>
        title="Empleados"
        columns={columns}
        apiEndpoint="/api/mecanicos"
        fields={formFields}
        createNewItem={createNewMecanico}
        refreshTrigger={refreshTrigger}
        validationSchema={yup.object({
          name: yup.string().required("El nombre es requerido"),
          dni: yup
            .string()
            .matches(/^\d+$/, "El DNI debe contener solo nmeros")
            .nullable(),
          email: yup.string().email("El email es inválido").nullable(),
          phone: yup.string().nullable(),
        })}
        extraActions={extraActions}
      />
      {selectedEmpleado && (
        <UploadImageModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveDNIImage}
          title="Agregar Foto DNI"
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

export default MecanicosPage;
