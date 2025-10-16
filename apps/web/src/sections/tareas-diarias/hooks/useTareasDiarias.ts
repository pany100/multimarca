import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

interface TareaDiaria {
  id: number;
  descripcion: string;
  realizado: boolean;
  fecha: string;
  usuarioId: number;
  usuario?: {
    id: number;
    fullName: string;
    username: string;
  };
}

interface UseTareasDiariasProps {
  onSuccess?: () => void;
  userData?: {
    id: number;
    fullName: string;
    username?: string;
  } | null;
}

export default function useTareasDiarias({
  onSuccess,
  userData,
}: UseTareasDiariasProps = {}) {
  const { authFetch } = useFetch();
  const [tareas, setTareas] = useState<TareaDiaria[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  /**
   * Obtiene las tareas diarias para una fecha específica
   * @param fecha - Fecha en formato YYYY-MM-DD (opcional)
   * @param incluirAnteriores - Si es true, incluye tareas pendientes de fechas anteriores
   * @param search - Texto de búsqueda (opcional)
   * @param nombre - Nombre de usuario para filtrar (opcional)
   */
  const obtenerTareasDiarias = useCallback(async (
    fecha?: string,
    incluirAnteriores: boolean = true,
    search?: string,
    nombre?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fecha) params.append('fecha', fecha);
      params.append('incluirAnteriores', incluirAnteriores.toString());
      if (search) params.append('search', search);
      if (nombre) params.append('nombre', nombre);

      const response = await authFetch(
        `/api/tareas-diarias?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setTareas(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al obtener tareas diarias");
        setSnackbar({
          open: true,
          message: errorData.error || "Error al obtener tareas diarias",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al obtener tareas diarias:", error);
      setError("Error al obtener tareas diarias");
      setSnackbar({
        open: true,
        message: `Error al obtener tareas diarias: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  /**
   * Crea una nueva tarea diaria
   * @param descripcion - Descripción de la tarea
   */
  const crearTareaDiaria = async (descripcion: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/tareas-diarias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descripcion }),
      });

      if (response.ok) {
        const nuevaTarea = await response.json();
        // Agregar información del usuario si no viene del backend
        const tareaConUsuario = {
          ...nuevaTarea,
          usuario: nuevaTarea.usuario || (userData ? {
            id: userData.id,
            fullName: userData.fullName,
            username: userData.username || userData.fullName, // Fallback si no hay username
          } : undefined),
        };
        setTareas((prevTareas) => [...prevTareas, tareaConUsuario]);
        setSnackbar({
          open: true,
          message: "Tarea creada con éxito",
          severity: "success",
        });
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear tarea");
        setSnackbar({
          open: true,
          message: errorData.error || "Error al crear tarea",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al crear tarea diaria:", error);
      setError("Error al crear tarea diaria");
      setSnackbar({
        open: true,
        message: `Error al crear tarea diaria: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza una tarea existente
   * @param id - ID de la tarea
   * @param data - Datos a actualizar (descripcion y/o realizado)
   */
  const actualizarTareaDiaria = async (
    id: number,
    data: { descripcion?: string; realizado?: boolean }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/api/tareas-diarias/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const tareaActualizada = await response.json();
        setTareas((prevTareas) =>
          prevTareas.map((tarea) =>
            tarea.id === id ? tareaActualizada : tarea
          )
        );
        setSnackbar({
          open: true,
          message: "Tarea actualizada con éxito",
          severity: "success",
        });
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al actualizar tarea");
        setSnackbar({
          open: true,
          message: errorData.error || "Error al actualizar tarea",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al actualizar tarea diaria:", error);
      setError("Error al actualizar tarea diaria");
      setSnackbar({
        open: true,
        message: `Error al actualizar tarea diaria: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambia el estado de realizado/pendiente de una tarea
   * @param id - ID de la tarea
   * @param realizado - Nuevo estado
   */
  const cambiarEstadoTarea = async (id: number, realizado: boolean) => {
    return actualizarTareaDiaria(id, { realizado });
  };

  /**
   * Elimina una tarea
   * @param id - ID de la tarea a eliminar
   */
  const eliminarTareaDiaria = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/api/tareas-diarias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTareas((prevTareas) =>
          prevTareas.filter((tarea) => tarea.id !== id)
        );
        setSnackbar({
          open: true,
          message: "Tarea eliminada con éxito",
          severity: "success",
        });
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al eliminar tarea");
        setSnackbar({
          open: true,
          message: errorData.error || "Error al eliminar tarea",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al eliminar tarea diaria:", error);
      setError("Error al eliminar tarea diaria");
      setSnackbar({
        open: true,
        message: `Error al eliminar tarea diaria: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    tareas,
    loading,
    error,
    snackbar,
    setSnackbar,
    obtenerTareasDiarias,
    crearTareaDiaria,
    actualizarTareaDiaria,
    cambiarEstadoTarea,
    eliminarTareaDiaria,
  };
}
