import { useFetch } from "@/contexts/FetchContext";
import { useOrdenDeCompraContext } from "@/sections/orden-de-compra/admin/contexts/OrdenDeCompraContext";
import { useState } from "react";

export const useOrdenDeCompraItemsManager = () => {
  const { orden, setOrden } = useOrdenDeCompraContext();
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(false);

  const refetchOrden = async () => {
    const response = await authFetch(`/api/orden-de-compra/${orden.id}`);
    if (response.ok) {
      const data = await response.json();
      setOrden(data);
    }
  };

  const addItem = async (data: {
    stockId: number;
    cantidad: number;
    precioUnitario?: number | null;
    iva?: number | null;
  }) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-de-compra/${orden.id}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al agregar el item");
      }

      await refetchOrden();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-de-compra/${orden.id}/items/${itemId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el item");
      }

      await refetchOrden();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (
    itemId: number,
    data: {
      stockId?: number;
      cantidad?: number;
      precioUnitario?: number | null;
      iva?: number | null;
    },
  ) => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/api/orden-de-compra/${orden.id}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el item");
      }

      await refetchOrden();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addItem, deleteItem, updateItem, loading };
};
