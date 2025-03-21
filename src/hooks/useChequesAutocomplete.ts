import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";

function useChequesAutocomplete() {
  const { authFetch } = useFetch();

  const searchCheques = async (query: string) => {
    const response = await authFetch(
      `/api/cheques?query=${query}&page=0&size=10`
    );
    const data = await response.json();
    const results = data.items.map(
      (cheque: {
        numero: string;
        id: number;
        banco: string;
        importe: number;
      }) => ({
        value: cheque.id,
        label: `Nro ${cheque.numero} - Banco ${
          cheque.banco
        } - Importe ${getFormattedPrice(cheque.importe)}`,
      })
    );
    return results;
  };

  const initialCheque = async (id: string) => {
    const response = await authFetch(`/api/cheques/${id}`);
    const data = await response.json();
    return {
      label: `Nro ${data.numero} - Banco ${
        data.banco
      } - Importe ${getFormattedPrice(data.importe)}`,
      value: data.id,
    };
  };
  return {
    searchCheques,
    initialCheque,
  };
}

export default useChequesAutocomplete;
