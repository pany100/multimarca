import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

export interface ProveedorStats {
  proveedorId: number;
  proveedorNombre: string;
  totalGastado: number;
  cantidadOrdenesCompra: number;
  cantidadReparacionesTerceroOrden: number;
  cantidadReparacionesTerceroVenta: number;
  cantidadTotal: number;
}

export interface ProveedoresResponse {
  totalGlobal: number;
  cantidadOrdenesCompra: number;
  cantidadReparacionesTerceroOrden: number;
  cantidadReparacionesTerceroVenta: number;
  cantidadTotal: number;
  proveedores: ProveedorStats[];
}

function normalizeNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function useProveedores() {
  const { authFetch } = useFetch();
  const [total, setTotal] = useState({
    totalGlobal: 0,
    cantidadOrdenesCompra: 0,
    cantidadReparacionesTerceroOrden: 0,
    cantidadReparacionesTerceroVenta: 0,
    cantidadTotal: 0,
  });
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
          cantidadOrdenesCompra: normalizeNumber(data.cantidadOrdenesCompra),
          cantidadReparacionesTerceroOrden: normalizeNumber(
            data.cantidadReparacionesTerceroOrden
          ),
          cantidadReparacionesTerceroVenta: normalizeNumber(
            data.cantidadReparacionesTerceroVenta
          ),
          cantidadTotal: normalizeNumber(data.cantidadTotal),
        });

        const list = Array.isArray(data.proveedores) ? data.proveedores : [];
        setProveedores(
          list.map((p) => ({
            proveedorId: normalizeNumber(p.proveedorId),
            proveedorNombre: p.proveedorNombre ?? "Sin nombre",
            totalGastado: normalizeNumber(p.totalGastado),
            cantidadOrdenesCompra: normalizeNumber(p.cantidadOrdenesCompra),
            cantidadReparacionesTerceroOrden: normalizeNumber(
              p.cantidadReparacionesTerceroOrden
            ),
            cantidadReparacionesTerceroVenta: normalizeNumber(
              p.cantidadReparacionesTerceroVenta
            ),
            cantidadTotal: normalizeNumber(p.cantidadTotal),
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
    setTotal({
      totalGlobal: 0,
      cantidadOrdenesCompra: 0,
      cantidadReparacionesTerceroOrden: 0,
      cantidadReparacionesTerceroVenta: 0,
      cantidadTotal: 0,
    });
    setProveedores([]);
  }, []);

  return { total, proveedores, searchProveedores, clearProveedores, loading };
}

export default useProveedores;
