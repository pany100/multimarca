import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

export interface TotalManoDeObra {
  totalManoDeObra: number;
  cantidadTotalOrdenesAtendidas: number;
}

export interface TopManoDeObraItem {
  descripcion: string;
  totalPorTrabajo: number;
  cantidadOrdenes: number;
}

export interface ManoDeObraResponseRaw {
  totalManoDeObra: number;
  cantidadTotalOrdenesAtendidas: number;
  ordenes: TopManoDeObraItem[];
}

function normalizeNumber(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  return Number(v);
}

function ensureTotal(row: any | null | undefined): TotalManoDeObra {
  const r = row || {};
  return {
    totalManoDeObra: normalizeNumber(r.totalManoDeObra),
    cantidadTotalOrdenesAtendidas: normalizeNumber(
      r.cantidadTotalOrdenesAtendidas
    ),
  };
}

function ensureTopList(rows: any[] | null | undefined): TopManoDeObraItem[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    descripcion: r.descripcion,
    totalPorTrabajo: normalizeNumber(r.totalPorTrabajo),
    cantidadOrdenes: normalizeNumber(r.cantidadOrdenes),
  }));
}

function useManoDeObra() {
  const { authFetch } = useFetch();
  const [total, setTotal] = useState<TotalManoDeObra>({
    totalManoDeObra: 0,
    cantidadTotalOrdenesAtendidas: 0,
  });
  const [top, setTop] = useState<TopManoDeObraItem[]>([]);
  const [loading, setLoading] = useState(false);

  const searchManoDeObra = useCallback(
    async (from?: Date | null, to?: Date | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (from) params.set("from", from.toISOString());
        if (to) params.set("to", to.toISOString());

        const response = await authFetch(
          `/api/estadisticas/mano-de-obra?${params.toString()}`
        );
        const data: ManoDeObraResponseRaw = await response.json();

        // totalManoDeObra could come as a single object or an array with one row
        setTotal(
          ensureTotal({
            totalManoDeObra: data.totalManoDeObra,
            cantidadTotalOrdenesAtendidas: data.cantidadTotalOrdenesAtendidas,
          })
        );

        // topManoDeObra expected as array of rows
        const topRows = Array.isArray(data?.ordenes) ? data?.ordenes : [];
        setTop(ensureTopList(topRows));

        return {
          ...ensureTotal({
            totalManoDeObra: data.totalManoDeObra,
            cantidadTotalOrdenesAtendidas: data.cantidadTotalOrdenesAtendidas,
          }),
          ...ensureTopList(topRows),
        };
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const clearManoDeObra = useCallback(() => {
    setTotal({
      totalManoDeObra: 0,
      cantidadTotalOrdenesAtendidas: 0,
    });
    setTop([]);
  }, []);

  return { total, top, searchManoDeObra, clearManoDeObra, loading };
}

export default useManoDeObra;
