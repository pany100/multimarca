import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

export default function useVentasInformacionCliente() {
  const { authFetch } = useFetch();
  const [initialOptions, setInitialOptions] = useState<
    Array<{ id: number; informacionCliente: string }>
  >([]);

  const searchInformacionCliente = async (searchText: string) => {
    try {
      const response = await authFetch(
        `/api/ventas/informacion-cliente?query=${encodeURIComponent(
          searchText
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        setInitialOptions(data);
        return data.map((item: any) => ({
          value: item.informacionCliente,
          label: item.informacionCliente,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching informacionCliente:", error);
      return [];
    }
  };

  const initialInformacionCliente = async (id: string) => {
    const response = await authFetch(`/api/ventas/${id}`);
    const data = await response.json();
    return {
      label: data.informacionCliente,
      value: data.informacionCliente,
    };
  };

  return {
    searchInformacionCliente,
    initialInformacionCliente,
  };
}
