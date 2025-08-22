import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function useCategoriasGasto() {
  const { authFetch } = useFetch();
  const [categorias, setCategorias] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasData = await authFetch("/api/categorias-gasto");
        const categoriasObj = await categoriasData.json();
        const newCategorias = categoriasObj.items.map(
          (el: { id: number; nombre: string }) => ({
            label: el.nombre,
            value: el.id,
          })
        );
        setCategorias(newCategorias);
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };
    fetchCategorias();
  }, [authFetch]);

  return {
    categorias,
  };
}

export default useCategoriasGasto;
