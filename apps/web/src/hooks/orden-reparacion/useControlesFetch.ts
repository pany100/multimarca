import { useFetch } from "@/contexts/FetchContext";
import {
  getSortedCheckControls,
  getSortedGroupControls,
  getSortedTextControls,
} from "@/utils/fieldHelper";
import { useEffect, useState } from "react";

export type ControlMecanico = {
  id: number;
  name: string;
  type: "checkbox" | "texto";
  valor: string;
  ordenEnPdf?: number;
  pdfName?: string;
  parent: {
    id: number;
    name: string;
  } | null;
};

const useControlesFetch = () => {
  const { authFetch } = useFetch();
  const [controlesList, setControlesList] = useState<ControlMecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all controls without pagination
        const response = await authFetch(
          "/api/controles-mecanicos?page=0&size=1000"
        );

        if (!response.ok) {
          throw new Error("Error al obtener los controles mecánicos");
        }

        const data = await response.json();
        setControlesList(data.items || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching controles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchControles();
  }, [authFetch]);

  const checkControls = getSortedCheckControls(controlesList);
  const textControls = getSortedTextControls(controlesList);
  const groupControls = getSortedGroupControls(controlesList);

  return {
    checkControls,
    textControls,
    groupControls,
    controlesList,
    loading,
    error,
  };
};

export default useControlesFetch;
