import { useState } from "react";
import { useFormContext } from "react-hook-form";
import useStockProveedores from "./useStockProveedores";

function useItemsModal() {
  const { watch } = useFormContext();
  const { stockOptions } = useStockProveedores({
    proveedorId: watch("proveedorId"),
  });
  const [modalInputs, setModalInputs] = useState<{
    stockId: number | null;
    cantidad: number | null;
  }>({
    stockId: null,
    cantidad: null,
  });
  const [errors, setErrors] = useState<{
    stockId: string | null;
    cantidad: string | null;
  }>({
    stockId: null,
    cantidad: null,
  });

  const validate = () => {
    if (!modalInputs.stockId && !modalInputs.cantidad) {
      setErrors({
        stockId: "Debe seleccionar un stock",
        cantidad: "Debe ingresar una cantidad",
      });
      return false;
    } else if (!modalInputs.stockId) {
      setErrors({
        stockId: "Debe seleccionar un stock",
        cantidad: null,
      });
      return false;
    } else if (!modalInputs.cantidad) {
      setErrors({
        stockId: null,
        cantidad: "Debe ingresar una cantidad",
      });
      return false;
    }
    return true;
  };

  return {
    stockOptions,
    validate,
    formErrors: errors,
    modalInputs,
    setStockId: (stockId: number | null) =>
      setModalInputs({ ...modalInputs, stockId }),
    setCantidad: (cantidad: number | null) =>
      setModalInputs({ ...modalInputs, cantidad }),
  };
}

export default useItemsModal;
