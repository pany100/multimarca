import { useFetch } from "@/contexts/FetchContext";

interface ManoDeObra {
  id: number;
  name: string;
  sellPrice: string;
}

interface ManoDeObraResponse {
  items: ManoDeObra[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export function useGetCurrentManoDeObra() {
  const { authFetch } = useFetch();

  const getCurrentManoDeObra = async (
    query: string | null
  ): Promise<ManoDeObra | null> => {
    if (!query) {
      return null;
    }

    try {
      const response = await authFetch(
        `/api/mano-de-obra?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        return null;
      }

      const data: ManoDeObraResponse = await response.json();
      // Return null if there's not exactly 1 result
      if (data.items.length !== 1) {
        return null;
      }

      return data.items[0];
    } catch (error) {
      console.error("Error fetching mano de obra:", error);
      return null;
    }
  };

  return { getCurrentManoDeObra };
}
