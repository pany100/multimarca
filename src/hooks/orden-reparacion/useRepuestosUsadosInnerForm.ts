function useRepuestosUsadosInnerForm() {
  const validateRepuestosUsados = (newItem: any) => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    if (!newItem || !newItem.stock) {
      errors.id = "Debe seleccionar un repuesto";
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  };

  return { validateRepuestosUsados };
}

export default useRepuestosUsadosInnerForm;
