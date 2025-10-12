import { useFetch } from "@/contexts/FetchContext";

function useEmpleadoPersistence() {
  const { authFetch } = useFetch();

  const createEmpleado = async (data: any) => {
    try {
      const url = new URL("/api/mecanicos", window.location.origin);
      const baseUrl = `${url.origin}${url.pathname}`;

      const response = await authFetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    createEmpleado,
  };
}

export default useEmpleadoPersistence;
