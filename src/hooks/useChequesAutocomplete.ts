import { useFetch } from "@/contexts/FetchContext";

function useChequesAutocomplete() {
  const { authFetch } = useFetch();

  const searchCheques = async (query: string) => {
    const response = await authFetch(
      `/api/cheques?query=${query}&page=0&size=10`
    );
    const data = await response.json();
    const results = data.items.map(
      (cheque: { numero: string; id: number }) => ({
        value: cheque.id,
        label: cheque.numero,
      })
    );
    return results;
  };

  const initialCheque = async (id: string) => {
    const response = await authFetch(`/api/cheques/${id}`);
    const data = await response.json();
    return {
      label: data.numero,
      value: data.id,
    };
  };
  return {
    searchCheques,
    initialCheque,
  };
}

export default useChequesAutocomplete;
