import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function usePermisos() {
  const { authFetch } = useFetch();
  const [permisos, setPermisos] = useState<{ value: number; label: string }[]>(
    []
  );

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const permisosData = await authFetch("/api/permisos");
        const permisosObj = await permisosData.json();
        const newPermisos = permisosObj.map(
          (el: { id: number; name: string }) => ({
            label: el.name,
            value: el.name,
          })
        );
        console.log(newPermisos);
        setPermisos(newPermisos);
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };
    fetchPermisos();
  }, [authFetch]);

  return {
    permisos,
  };
}

export default usePermisos;
