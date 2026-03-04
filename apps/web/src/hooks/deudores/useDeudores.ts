import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

export interface Deudor {
  id: number;
  patente: string | null;
  cliente_nombre: string;
  cliente_phone: string | null;
  deuda_total: number;
}

interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const DEFAULT_FROM_DATE = new Date(2026, 0, 22); // 22/1/2026

function useDeudores() {
  const { authFetch } = useFetch();
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [loading, setLoading] = useState(false);

  const searchDeudores = useCallback(
    async (from?: Date, to?: Date) => {
      setLoading(true);
      try {
        const effectiveFrom = from ?? DEFAULT_FROM_DATE;

        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "10");
        if (effectiveFrom) params.set("from", effectiveFrom.toISOString());
        if (to) params.set("to", to.toISOString());

        const response = await authFetch(`/api/deudores?${params.toString()}`);
        const data: PagedResponse<Deudor> = await response.json();
        setDeudores(Array.isArray(data.items) ? data.items : []);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  return { deudores, searchDeudores, loading };
}

export default useDeudores;
