import { useFetch } from "@/contexts/FetchContext";
import { NotificacionInterna } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

function useNotificacionesImportantes() {
  const [notificacionesImportantes, setNotificaciones] = useState<
    NotificacionInterna[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await authFetch(
        "/api/notificaciones-internas/importantes"
      );
      const data = await response.json();
      setNotificaciones(data);

      // Si no hay notificaciones, limpiar el intervalo
      if (data.length === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    } catch (error) {
      console.error("Error al obtener notificaciones importantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchNotificaciones();

    // Configurar intervalo solo si no existe uno ya
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchNotificaciones, 10 * 60 * 1000); // 10 minutos
    }

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [authFetch]);

  const marcarComoLeida = async (id: number) => {
    try {
      await authFetch(`/api/notificaciones-internas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leida: true }),
      });

      // Actualizar la lista de notificaciones después de marcar como leída
      setNotificaciones((prev) => {
        const updated = prev.filter((notif) => notif.id !== id);
        // Si no quedan notificaciones, limpiar el intervalo
        if (updated.length === 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
        return updated;
      });
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  return {
    notificacionesImportantes,
    loading,
    marcarComoLeida,
  };
}

export default useNotificacionesImportantes;
