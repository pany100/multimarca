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

function useDeudores() {
  const { authFetch } = useFetch();
  const [deudores, setDeudores] = useState<Deudor[]>([]);

  const searchDeudores = useCallback(
    async (from?: Date, to?: Date) => {
      const params = new URLSearchParams();
      params.set("page", "0");
      params.set("size", "10");
      if (from) params.set("from", from.toISOString());
      if (to) params.set("to", to.toISOString());

      const response = await authFetch(`/api/deudores?${params.toString()}`);
      const data: PagedResponse<Deudor> = await response.json();
      setDeudores(Array.isArray(data.items) ? data.items : []);
      return data;
    },
    [authFetch]
  );

  return { deudores, searchDeudores };
}

export default useDeudores;
