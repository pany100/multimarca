import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { ObjectAutocomplete } from "@/sections/commons/NonFormObjectAutocomplete";
import { calcularPrecioVenta } from "@/utils/stock-pricing";

function useRepuestosObjectAutocomplete() {
  const { newItem, setNewItem, currentItem, setCurrentItem } =
    useFormDataWithModalContext();
  const selectOption = (
    option: ObjectAutocomplete | null,
    initialRender?: boolean
  ) => {
    if (option) {
      const precioVentaCalculado =
        calcularPrecioVenta(option.object.buyPrice, option.object.markup, option.object.sellIva) ?? 0;
      if (!initialRender) {
        setNewItem({
          id: option.value,
          ...newItem,
          stock: {
            id: option.value,
            name: option.object.name,
          },
          label: option.object.label,
          proveedor: option.object.proveedor,
          precioCompra: option.object.buyPrice,
          unidadesConsumidas: 1,
          precioUnitario: precioVentaCalculado.toFixed(2),
          precioVenta: precioVentaCalculado.toFixed(2),
        });
      } else {
        setNewItem({
          id: option.value,
          ...newItem,
          stock: {
            id: option.value,
            name: option.object.name,
          },
          label: option.object.label,
          proveedor: option.object.proveedor,
        });
      }
    }
  };

  return { selectOption };
}

export default useRepuestosObjectAutocomplete;
