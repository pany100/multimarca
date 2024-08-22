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
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "description", headerName: "Descripción", flex: 1 },
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (date: any) => {
        return new Date(date).toLocaleDateString("es-AR");
      },
    },
    { field: "whatsappKey", headerName: "Clave WhatsApp", flex: 1 },
    { field: "informacion", headerName: "Información", flex: 2 },
    {
      field: "processed",
      headerName: "Procesado",
      flex: 1,
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
      apiEndpoint="/api/recordatorios-whatsapp"
      fields={formFields}
      createNewItem={createNewNotificacion}
      shouldRenderDelete={(item: NotificacionWhatsapp) =>
        !item.processed && new Date(item.date) > new Date()
      }
      shouldRenderEdit={(item: NotificacionWhatsapp) =>
        !item.processed && new Date(item.date) > new Date()
      }
      validationSchema={yup.object({
        description: yup.string().required("La descripción es requerida"),
        date: yup
          .date()
          .required("La fecha es requerida")
          .min(new Date(), "La fecha debe ser futura"),
        whatsappKey: yup.string().required("La clave de WhatsApp es requerida"),
      })}
    />
  );
};

export default NotificacionesWhatsappPage;
