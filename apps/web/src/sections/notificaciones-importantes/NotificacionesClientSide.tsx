"use client";

import useNotificacionesImportantes from "./hooks/useNotificacionesImportantes";
import NotificacionesImportantesModal from "./NotificacionesImportantesModal";

function NotificacionesClientSide() {
  const { notificacionesImportantes, marcarComoLeida } =
    useNotificacionesImportantes();

  return (
    <NotificacionesImportantesModal
      notificaciones={notificacionesImportantes}
      onMarcarComoLeida={marcarComoLeida}
    />
  );
}

export default NotificacionesClientSide;
