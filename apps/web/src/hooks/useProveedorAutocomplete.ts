import { useFetch } from "@/contexts/FetchContext";

function useProveedorAutocomplete() {
  const { authFetch } = useFetch();

  const searchProveedores = async (query: string) => {
    const response = await authFetch(
      `/api/proveedores?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map((proveedor: { name: any; id: any }) => ({
      label: proveedor.name,
      value: proveedor.id,
    }));
  };

  const initialProveedor = async (id: string) => {
    const response = await authFetch(`/api/proveedores/${id}`);
    const data = await response.json();
    return {
      label: data.nombreProveedor,
      value: id,
    };
  };

  return {
    searchProveedores,
    initialProveedor,
  };
}

export default useProveedorAutocomplete;
