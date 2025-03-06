import { useFetch } from "@/contexts/FetchContext";

function useClientesAutocomplete() {
  const { authFetch } = useFetch();

  const searchClientes = async (query: string) => {
    const response = await authFetch(
      `/api/clientes?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map((cliente: { fullName: any; id: any }) => ({
      label: cliente.fullName,
      value: cliente.id,
    }));
  };

  const initialCliente = async (id: string) => {
    const response = await authFetch(`/api/clientes/${id}`);
    const data = await response.json();
    return {
      label: data.fullName,
      value: data.id,
    };
  };
  return {
    searchClientes,
    initialCliente,
  };
}

export default useClientesAutocomplete;
