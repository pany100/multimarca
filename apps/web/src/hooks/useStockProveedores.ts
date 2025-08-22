import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function useStockProveedores({ proveedorId }: { proveedorId?: number | null }) {
  const [stockOptions, setStockOptions] = useState<
    { value: string; label: string; name: string }[]
  >([]);
  const { authFetch } = useFetch();

  useEffect(() => {
    const searchStock = async () => {
      if (proveedorId) {
        const response = await authFetch(
          `/api/proveedores/${proveedorId}/stock?&page=0&size=100`
        );
        const data = await response.json();
        const results = data.items.map(
          (stock: { id: number; label: string; name: string }) => ({
            value: stock.id,
            label: stock.label,
            name: stock.name,
          })
        );
        setStockOptions(results);
      }
    };
    searchStock();
  }, [proveedorId, authFetch]);

  return {
    stockOptions,
  };
}

export default useStockProveedores;
