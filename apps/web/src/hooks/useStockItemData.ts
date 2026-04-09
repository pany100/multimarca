import { useState } from "react";
import { useFormContext } from "react-hook-form";

function useStockItemData({ onClose }: { onClose: () => void }) {
  const { watch, setValue } = useFormContext();
  const [stock, setStock] = useState<{
    stockId: string;
    name: string;
    label?: string;
  } | null>(null);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(null);
  const [iva, setIva] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitDisabled =
    stock === null ||
    cantidad === null ||
    cantidad === 0 ||
    precioUnitario === null ||
    precioUnitario === 0;

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
      precioUnitario: Number(precioUnitario),
      iva: Number(iva) || 0,
      label: stock?.label || "",
    };
    const updatedItems = [...items, newItem];
    setValue("items", updatedItems);
    setStock(null);
    setCantidad(null);
    setPrecioUnitario(null);
    setIva(null);
    onClose();
  };

  const onCancel = () => {
    setStock(null);
    setCantidad(null);
    setPrecioUnitario(null);
    setIva(null);
    setError(null);
    onClose();
  };

  return {
    onSubmit,
    onCancel,
    setStock,
    setCantidad,
    setPrecioUnitario,
    setIva,
    precioUnitario,
    iva,
    error,
    submitDisabled,
  };
}

export default useStockItemData;
