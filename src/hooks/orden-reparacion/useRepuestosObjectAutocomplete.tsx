import { useFormDataWithModalContext } from "@/contexts/FormDataWithModalContext";
import { ObjectAutocomplete } from "@/sections/commons/NonFormObjectAutocomplete";

function useRepuestosObjectAutocomplete() {
  const { newItem, setNewItem } = useFormDataWithModalContext();
  const selectOption = (
    option: ObjectAutocomplete | null,
    initialRender?: boolean
  ) => {
    if (option) {
      const precioVentaCalculado =
        option.object.buyPrice * (1 + (option.object.markup || 0) / 100);
      if (!initialRender) {
        setNewItem({
          id: option.value,
          ...newItem,
          stock: {
            id: option.value,
            name: option.object.name,
          },
          precioCompra: option.object.buyPrice,
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
        });
      }
    }
  };

  return { selectOption };
}

export default useRepuestosObjectAutocomplete;
