import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

type StockOption = { value: string; label: string; name: string };

function useStockProveedores({
  proveedorId,
  searchTerm = "",
}: {
  proveedorId?: number | null;
  searchTerm?: string;
}) {
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const { authFetch } = useFetch();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const searchStock = async () => {
      if (!proveedorId) {
        setStockOptions([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: "0",
          size: "50",
          query: debouncedSearch,
        });
        const response = await authFetch(
          `/api/proveedores/${proveedorId}/stock?${params.toString()}`,
        );
        const data = await response.json();
        if (cancelled) return;
        const results = data.items.map(
          (stock: { id: number; label: string; name: string }) => ({
            value: stock.id,
            label: stock.label,
            name: stock.name,
          }),
        );
        setStockOptions(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    searchStock();
    return () => {
      cancelled = true;
    };
  }, [proveedorId, debouncedSearch, authFetch]);

  return {
    stockOptions,
    loading,
  };
}

export default useStockProveedores;
