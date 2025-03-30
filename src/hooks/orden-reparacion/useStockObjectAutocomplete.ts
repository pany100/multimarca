import { useFetch } from "@/contexts/FetchContext";

export interface StockObject {
  id: number;
  name: string;
  buyPrice: number;
  markup: number;
}

function useStockObjectAutocomplete() {
  const { authFetch } = useFetch();

  const searchStockObject = async (query: string) => {
    const response = await authFetch(
      `/api/stock?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    return data.items.map(
      (repuesto: {
        name: string;
        id: number;
        buyPrice: number;
        markup: number;
      }) => ({
        value: repuesto.id,
        label: repuesto.name,
        object: repuesto,
      })
    );
  };

  const initialStock = async (id: string) => {
    const response = await authFetch(`/api/stock/${id}`);
    const data = await response.json();
    return {
      object: data,
      label: data.name,
      value: data.id,
    };
  };
  return { searchStockObject, initialStock };
}

export default useStockObjectAutocomplete;
