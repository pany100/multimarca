import { useFetch } from "@/contexts/FetchContext";
import { useCallback, useState } from "react";

export function usePatchTurnoVino(
  onSuccess?: () => void
) {
  const { authFetch } = useFetch();
  const [patchingId, setPatchingId] = useState<number | null>(null);

  const patchVino = useCallback(
    async (id: number, currentVino: boolean | null) => {
      const nextVino = !currentVino;
      setPatchingId(id);
      try {
        const res = await authFetch(`/api/turnos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vino: nextVino }),
        });
        if (!res.ok) throw new Error(await res.text());
        onSuccess?.();
      } finally {
        setPatchingId(null);
      }
    },
    [authFetch, onSuccess]
  );

  return { patchVino, patchingId };
}
