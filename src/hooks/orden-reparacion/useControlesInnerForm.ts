import { useFormContext } from "react-hook-form";

function useControlesInnerForm() {
  const { watch, setValue } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");

  const checkControls = controlesEnReparacion.filter(
    (control: { tipo: string }) => control.tipo === "checkbox"
  );
  const textControls = controlesEnReparacion.filter(
    (control: { tipo: string }) => control.tipo === "texto"
  );

  const handleControlChange = (id: number, value: string) => {
    const updatedControls = controlesEnReparacion.map(
      (control: { id: number; valor: string }) =>
        control.id === id ? { ...control, valor: value } : control
    );
    setValue("controlesEnReparacion", updatedControls);
  };

  return {
    checkControls,
    textControls,
    handleControlChange,
  };
}

export default useControlesInnerForm;
