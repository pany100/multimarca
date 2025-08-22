import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function useAllMechanics() {
  const [mechanics, setMechanics] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchAllMechanics = async () => {
      try {
        setLoading(true);
        const response = await authFetch(
          `/api/mecanicos?mecanicos=true&limit=100&page=0`
        );
        const data = await response.json();
        setMechanics(
          data.items.map((mecanico: { name: string; id: string }) => ({
            value: mecanico.id,
            label: mecanico.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching mechanics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMechanics();
  }, [authFetch]);

  return {
    mechanics,
    loading,
  };
}

export default useAllMechanics;
