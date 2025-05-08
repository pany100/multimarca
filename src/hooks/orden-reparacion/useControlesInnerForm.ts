import { useFormContext } from "react-hook-form";

function useControlesInnerForm() {
  const { watch, setValue } = useFormContext();
  const controlesEnReparacion = watch("controlesEnReparacion");
  const checkControls = controlesEnReparacion.filter(
    (control: { tipo: string; parent: { id: number } | null }) =>
      control.tipo === "checkbox" && control.parent === null
  );
  const textControls = controlesEnReparacion.filter(
    (control: { tipo: string; parent: { id: number } | null }) =>
      control.tipo === "texto" && control.parent === null
  );
  const groupControlsList = controlesEnReparacion.filter(
    (control: { tipo: string; parent: { id: number } | null }) =>
      control.tipo === "grupo"
  );

  // Transform group controls into the desired format
  const groupControls = groupControlsList.map(
    (groupControl: { id: number; nombre: string }) => {
      const childControls = controlesEnReparacion.filter(
        (control: { parent: { name: string } | null }) =>
          control.parent && control.parent.name === groupControl.nombre
      );

      return {
        name: groupControl.nombre,
        controls: childControls,
      };
    }
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
    groupControls,
    handleControlChange,
  };
}

export default useControlesInnerForm;
