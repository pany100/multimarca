import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

interface Recuperacion {
  id: number;
  fecha: string;
  monto: number;
  perdidaId: number;
  detalle?: string;
}

interface Dolar {
  id: number;
  fecha: string;
  blue: number;
  oficial: number;
}

interface Perdida {
  id: number;
  fecha: string;
  monto: number;
  descripcion: string;
  moneda: "Peso" | "Dolar";
  dolar?: Dolar;
  dolarId?: number;
  recuperaciones: Recuperacion[];
}

export const usePerdida = (id: number, refreshTrigger?: number) => {
  const [perdida, setPerdida] = useState<Perdida | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchPerdida = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await authFetch(`/api/perdida/${id}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPerdida(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar la pérdida");
        console.error("Error fetching perdida:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerdida();
  }, [id, authFetch, refreshTrigger]);

  return { perdida, loading, error };
};

export default usePerdida;
