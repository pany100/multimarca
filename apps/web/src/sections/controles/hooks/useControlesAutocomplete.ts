import { useFetch } from "@/contexts/FetchContext";

function useControlesAutocomplete() {
  const { authFetch } = useFetch();

  const searchControles = async (query: string) => {
    const response = await authFetch(
      `/api/controles-mecanicos?query=${query}&size=10&page=0`
    );
    const data = await response.json();
    return data.items.map(
      (control: { name: string; id: number; type: string }) => ({
        label: control.name,
        value: control.id.toString(),
        type: control.type,
      })
    );
  };

  const initialControl = async (id: string) => {
    try {
      // Since there's no specific GET endpoint for a single control,
      // we'll search with an empty query and find the control by ID
      const response = await authFetch(
        `/api/controles-mecanicos?size=100&page=0`
      );
      const data = await response.json();
      const control = data.items.find(
        (item: { id: number }) => item.id === parseInt(id)
      );

      if (control) {
        return {
          label: control.name,
          value: id,
          type: control.type,
        };
      }

      return {
        label: "Control no encontrado",
        value: id,
        type: "",
      };
    } catch (error) {
      console.error("Error fetching initial control:", error);
      return {
        label: "Error al cargar control",
        value: id,
        type: "",
      };
    }
  };

  return {
    searchControles,
    initialControl,
  };
}

export default useControlesAutocomplete;
