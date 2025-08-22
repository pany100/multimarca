function useReparacionTercerosFormValidator() {
  const validator = (newItem: any) => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    if (!newItem || !newItem.proveedor) {
      errors.proveedor = "Debe seleccionar un proveedor";
      hasErrors = true;
    }
    if (!newItem || !newItem.nombre) {
      errors.nombre = "Debe ingresar un nombre";
      hasErrors = true;
    }
    if (!newItem || !newItem.precioCompra) {
      errors.precioCompra = "Debe ingresar un precio de compra";
      hasErrors = true;
    }
    if (!newItem || !newItem.precioVenta) {
      errors.precioVenta = "Debe ingresar un precio de venta";
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  };

  return { validator };
}

export default useReparacionTercerosFormValidator;
