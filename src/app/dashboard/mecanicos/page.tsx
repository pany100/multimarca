"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { useFetch } from "@/contexts/FetchContext";
import MecanicosForm, { schema } from "@/sections/mecanicos/MecanicosForm";
import MecanicosTable from "@/sections/mecanicos/MecanicosTable";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <ABMPage
      apiEndpoint="/api/mecanicos"
      table={MecanicosTable}
      form={MecanicosForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );

  // return (
  //   <>
  //     <CrudTable<Mecanico>
  //       title="Empleados"
  //       columns={columns}
  //       apiEndpoint="/api/mecanicos"
  //       fields={formFields}
  //       createNewItem={createNewMecanico}
  //       refreshTrigger={refreshTrigger}
  //       validationSchema={yup.object({
  //         name: yup.string().required("El nombre es requerido"),
  //         dni: yup
  //           .string()
  //           .matches(/^\d+$/, "El DNI debe contener solo nmeros")
  //           .nullable(),
  //         email: yup.string().email("El email es inválido").nullable(),
  //         phone: yup.string().nullable(),
  //       })}
  //       extraActions={extraActions}
  //     />
  //     {selectedEmpleado && (
  //       <UploadImageModal
  //         open={modalOpen}
  //         onClose={() => setModalOpen(false)}
  //         onSave={handleSaveDNIImage}
  //         title="Agregar Foto DNI"
  //       />
  //     )}
  //     <Snackbar
  //       open={snackbar.open}
  //       autoHideDuration={6000}
  //       onClose={() => setSnackbar({ ...snackbar, open: false })}
  //     >
  //       <Alert
  //         severity={snackbar.severity}
  //         onClose={() => setSnackbar({ ...snackbar, open: false })}
  //       >
  //         {snackbar.message}
  //       </Alert>
  //     </Snackbar>
  //   </>
  // );
};

export default MecanicosPage;
