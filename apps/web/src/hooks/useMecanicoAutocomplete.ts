import { useFetch } from "@/contexts/FetchContext";

function useMecanicoAutocomplete() {
  const { authFetch } = useFetch();

  const searchMecanicos = async (query: string) => {
    const response = await authFetch(
      `/api/mecanicos?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map((mecanico: { name: string; id: number }) => ({
      label: mecanico.name,
      value: mecanico.id,
    }));
  };

  const initialMecanico = async (id: string) => {
    const response = await authFetch(`/api/mecanicos/${id}`);
    const data = await response.json();
    return {
      label: data.name,
      value: data.id,
    };
  };
  return {
    searchMecanicos,
    initialMecanico,
  };
}

export default useMecanicoAutocomplete;
