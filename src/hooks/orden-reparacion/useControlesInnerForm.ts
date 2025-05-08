import { useFormContext } from "react-hook-form";

function useControlesInnerForm() {
  const { watch, setValue } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");

  const handleControlChange = (id: number, value: string) => {
    const updatedControls = controlesEnReparacion.map(
      (control: { id: number; valor: string }) =>
        control.id === id ? { ...control, valor: value } : control
    );
    setValue("controlesEnReparacion", updatedControls);
  };

  return {
    handleControlChange,
  };
}

export default useControlesInnerForm;
