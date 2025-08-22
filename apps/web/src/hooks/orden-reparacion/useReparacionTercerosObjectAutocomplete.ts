import { useFetch } from "@/contexts/FetchContext";

function useReparacionTercerosObjectAutocomplete() {
  const { authFetch } = useFetch();
  const searchProveedores = async (query: string) => {
    const response = await authFetch(
      `/api/proveedores?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map((proveedor: { name: string; id: number }) => ({
      value: proveedor.id,
      label: proveedor.name,
      object: {
        id: proveedor.id,
        name: proveedor.name,
      },
    }));
  };

  const initialProveedores = async (id: string) => {
    const response = await authFetch(`/api/proveedores/${id}`);
    const data = await response.json();
    return {
      object: {
        id,
        name: data.nombreProveedor,
      },
      label: data.nombreProveedor,
      value: id,
    };
  };

  return { searchProveedores, initialProveedores };
}

export default useReparacionTercerosObjectAutocomplete;
