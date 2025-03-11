import { useFetch } from "@/contexts/FetchContext";

function useStockData() {
  const { authFetch } = useFetch();

  const fetchStockData = async (stockId: number) => {
    const response = await authFetch(`/api/stock/${stockId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch stock");
    }
    const data = await response.json();
    return data;
  };

  return {
    fetchStockData,
  };
}

export default useStockData;
