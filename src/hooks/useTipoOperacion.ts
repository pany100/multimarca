import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

export default function useTipoOperacion() {
  const { authFetch } = useFetch();
  const [tiposOperacion, setTiposOperacion] = useState<
    { value: number; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiposOperacion = async () => {
      try {
        setLoading(true);
        const response = await authFetch("/api/tipo-operacion");
        const data = await response.json();

        if (data) {
          const formattedData = data.map(
            (tipo: { id: number; label: string }) => ({
              value: tipo.id,
              label: tipo.label,
            })
          );
          setTiposOperacion(formattedData);
        }
      } catch (err) {
        setError("Error al cargar tipos de operación");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTiposOperacion();
  }, [authFetch]);

  return { tiposOperacion, loading, error };
}
