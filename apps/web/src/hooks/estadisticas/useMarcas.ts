import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

export default function useMarcas() {
  const { authFetch } = useFetch();
  const [marcas, setMarcas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authFetch("/api/marcas");
        const data = await response.json();
        if (Array.isArray(data)) {
          setMarcas(data);
        } else {
          setMarcas([]);
        }
      } catch (err) {
        setError("Error al cargar marcas");
        console.error(err);
        setMarcas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, [authFetch]);

  return { marcas, loading, error };
}
