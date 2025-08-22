import { useFetch } from "@/contexts/FetchContext";

function useAutosAutocomplete() {
  const { authFetch } = useFetch();

  const searchAutos = async (query: string) => {
    const response = await authFetch(
      `/api/autos?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map(
      (auto: { patent: string; id: number; brand: string; model: string }) => ({
        label: `${auto.patent} - ${auto.brand || ""} ${auto.model || ""}`,
        value: auto.id.toString(),
      })
    );
  };

  const initialAuto = async (id: string) => {
    const response = await authFetch(`/api/autos/${id}`);
    const data = await response.json();
    return {
      label: `${data.patent} - ${data.brand || ""} ${data.model || ""}`,
      value: id,
    };
  };

  return {
    searchAutos,
    initialAuto,
  };
}

export default useAutosAutocomplete;
