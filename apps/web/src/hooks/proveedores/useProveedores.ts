import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

export interface ProveedorStats {
  proveedorNombre: string;
  totalGastado: number;
  cantidadGastos: number;
}

export interface ProveedoresResponse {
  totalGlobal: number;
  cantidadGastos: number;
  proveedores: ProveedorStats[];
}

function normalizeNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  return Number(v);
}

function useProveedores() {
  const { authFetch } = useFetch();
  const [total, setTotal] = useState({ totalGlobal: 0, cantidadGastos: 0 });
  const [proveedores, setProveedores] = useState<ProveedorStats[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProveedores = useCallback(
    async (from?: Date | null, to?: Date | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (from) params.set("from", from.toISOString());
        if (to) params.set("to", to.toISOString());

        const response = await authFetch(
          `/api/estadisticas/proveedores?${params.toString()}`
        );
        const data: ProveedoresResponse = await response.json();

        setTotal({
          totalGlobal: normalizeNumber(data.totalGlobal),
          cantidadGastos: normalizeNumber(data.cantidadGastos),
        });

        const list = Array.isArray(data.proveedores) ? data.proveedores : [];
        setProveedores(
          list.map((p) => ({
            proveedorNombre: p.proveedorNombre ?? "Sin nombre",
            totalGastado: normalizeNumber(p.totalGastado),
            cantidadGastos: normalizeNumber(p.cantidadGastos),
          }))
        );

        return data;
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const clearProveedores = useCallback(() => {
    setTotal({ totalGlobal: 0, cantidadGastos: 0 });
    setProveedores([]);
  }, []);

  return { total, proveedores, searchProveedores, clearProveedores, loading };
}

export default useProveedores;
