function useMechanicsInnerForm() {
  const validateForm = (newItem: any) => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    if (!newItem || !newItem.id) {
      errors.id = "Debe seleccionar un mecánico";
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  };
  return {
    validateForm,
  };
}

export default useMechanicsInnerForm;
