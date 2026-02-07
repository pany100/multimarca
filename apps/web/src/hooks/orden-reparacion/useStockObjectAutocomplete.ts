import { useFetch } from "@/contexts/FetchContext";

export interface StockObject {
  id: number;
  name: string;
  label: string;
  buyPrice: number;
  markup: number;
}

function useStockObjectAutocomplete() {
  const { authFetch } = useFetch();

  const searchStockObject = async (query: string) => {
    const response = await authFetch(
      `/api/stock?query=${query}&size=20&page=0`,
    );
    const data = await response.json();
    return data.items.map(
      (repuesto: {
        name: string;
        label: string;
        id: number;
        buyPrice: number;
        markup: number;
      }) => ({
        value: repuesto.id,
        label: `${repuesto.name} - ${repuesto.label}`,
        object: repuesto,
      }),
    );
  };

  const initialStock = async (id: string) => {
    const response = await authFetch(`/api/stock/${id}`);
    const data = await response.json();
    return {
      object: data,
      label: `${data.name} - ${data.label}`,
      value: data.id,
    };
  };
  return { searchStockObject, initialStock };
}

export default useStockObjectAutocomplete;
