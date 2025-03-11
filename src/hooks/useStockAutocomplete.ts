import { useFetch } from "@/contexts/FetchContext";

function useStockAutocomplete() {
  const { authFetch } = useFetch();

  const searchStock = async (query: string) => {
    const response = await authFetch(
      `/api/stock?query=${query}&page=0&size=10`
    );
    const data = await response.json();
    const results = data.items.map(
      (stock: { name: string; id: number; price: number }) => ({
        id: stock.id,
        name: stock.name,
        price: stock.price,
      })
    );
    return results;
  };

  return {
    searchStock,
  };
}

export default useStockAutocomplete;
