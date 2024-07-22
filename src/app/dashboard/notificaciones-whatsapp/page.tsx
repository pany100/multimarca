"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import * as yup from "yup";

interface NotificacionWhatsapp {
  id: string;
  description: string;
  date: string;
  whatsappKey: string;
  informacion: string;
  processed: boolean;
}

const NotificacionesWhatsappPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "description", headerName: "Descripción", width: 200 },
    { field: "date", headerName: "Fecha", width: 150 },
    { field: "whatsappKey", headerName: "Clave WhatsApp", width: 150 },
    { field: "informacion", headerName: "Información", width: 200 },
    {
      field: "processed",
      headerName: "Procesado",
      width: 100,
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "description", label: "Descripción", type: "text" },
    { name: "date", label: "Fecha", type: "date" },
    { name: "whatsappKey", label: "Clave WhatsApp", type: "text" },
  ];

  const createNewNotificacion = (): NotificacionWhatsapp => {
    return {
      id: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      whatsappKey: "",
      informacion: "",
      processed: false,
    };
  };

  return (
    <CrudTable<NotificacionWhatsapp>
      title="Notificaciones WhatsApp"
      columns={columns}
      apiEndpoint="/api/notificaciones-whatsapp"
      fields={formFields}
      createNewItem={createNewNotificacion}
      validationSchema={yup.object({
        description: yup.string().required("La descripción es requerida"),
        date: yup.date().required("La fecha es requerida"),
        whatsappKey: yup.string().required("La clave de WhatsApp es requerida"),
      })}
    />
  );
};

export default NotificacionesWhatsappPage;
