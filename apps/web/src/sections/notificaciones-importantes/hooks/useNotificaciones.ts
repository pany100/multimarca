import { useFetch } from "@/contexts/FetchContext";

function useNotificaciones() {
  const { authFetch } = useFetch();

  const marcarComoLeida = async (id: number) => {
    try {
      await authFetch(`/api/notificaciones-internas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leida: true }),
      });
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  return {
    marcarComoLeida,
  };
}

export default useNotificaciones;
