function useTrabajosRealizadosValidator() {
  const validateForm = (newItem: any) => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    if (!newItem || !newItem.manoDeObra) {
      errors.manoDeObra = "Debe seleccionar una mano de obra";
      hasErrors = true;
    }
    if (!newItem || !newItem.precioUnitario) {
      errors.precioUnitario = "Debe ingresar un precio unitario";
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  };

  return { validateForm };
}

export default useTrabajosRealizadosValidator;
