import { useState } from "react";
import { useFormContext } from "react-hook-form";

function useStockItemData({ onClose }: { onClose: () => void }) {
  const { watch, setValue } = useFormContext();
  const [stock, setStock] = useState<{
    stockId: string;
    name: string;
  } | null>(null);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitDisabled = stock === null || cantidad === null || cantidad === 0;
  const onSubmit = () => {
    setError(null);
    const items = watch("items") || [];
    if (items.some((item: any) => item.stockId === Number(stock?.stockId))) {
      setError("El stock ya existe en la orden");
      return;
    }
    const newItem = {
      ...stock,
      cantidad: Number(cantidad),
    };
    const updatedItems = [...items, newItem];
    setValue("items", updatedItems);
    setStock(null);
    setCantidad(null);
    onClose();
  };

  const onCancel = () => {
    setStock(null);
    setCantidad(null);
    setError(null);
    onClose();
  };

  return {
    onSubmit,
    onCancel,
    setStock,
    setCantidad,
    error,
    submitDisabled,
  };
}

export default useStockItemData;
