import { useFetch } from "@/contexts/FetchContext";

function useTrabajosObjectAutocomplete() {
  const { authFetch } = useFetch();

  const searchTrabajo = async (query: string) => {
    const response = await authFetch(
      `/api/mano-de-obra?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map(
      (trabajo: { name: string; id: number; sellPrice: number }) => ({
        value: trabajo.id,
        label: `${trabajo.name} - id:${trabajo.id}`,
        object: {
          id: trabajo.id,
          name: trabajo.name,
          sellPrice: trabajo.sellPrice,
        },
      })
    );
  };

  const initialTrabajo = async (id: string) => {
    const response = await authFetch(`/api/mano-de-obra/${id}`);
    const data = await response.json();
    return {
      object: data,
      label: `${data.name} - id:${data.id}`,
      value: data.id,
    };
  };

  return {
    searchTrabajo,
    initialTrabajo,
  };
}

export default useTrabajosObjectAutocomplete;
