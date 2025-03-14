import { useFormContext } from "react-hook-form";

export type ControlMecanico = {
  id: number;
  nombre: string;
  tipo: "checkbox" | "texto";
  valor: string;
};

type UseControlesProps = {
  controlesMecanicos: ControlMecanico[];
};

type ControlGroup = {
  title: string;
  controls: ControlMecanico[];
};

const useControles = ({ controlesMecanicos }: UseControlesProps) => {
  const { control, getValues, setValue } = useFormContext();

  // Helper function to handle control changes
  const handleControlChange = (id: number, valor: string) => {
    const controlesEnReparacion = getValues("controlesEnReparacion");
    const controlesActualizados = controlesEnReparacion.map(
      (control: ControlMecanico) => {
        if (control.id === id) {
          return { id, valor };
        }
        return control;
      }
    );
    setValue("controlesEnReparacion", controlesActualizados);
  };

  // Group controls by type for better organization
  const getGroupedControls = (): ControlGroup[] => {
    // Split the checkbox controls into two roughly equal groups
    const checkboxControls = controlesMecanicos.filter(
      (control) => control.tipo === "checkbox"
    );

    const midpoint = Math.ceil(checkboxControls.length / 2);
    const firstGroup = checkboxControls.slice(0, midpoint);
    const secondGroup = checkboxControls.slice(midpoint);

    const textControls = controlesMecanicos.filter(
      (control) => control.tipo === "texto"
    );

    return [
      { title: "Controles del Vehículo", controls: firstGroup },
      { title: "Controles Adicionales", controls: secondGroup },
      { title: "Información Adicional", controls: textControls },
    ];
  };

  // Get stats about completed controls
  const getControlStats = () => {
    const checkboxControls = controlesMecanicos.filter(
      (control) => control.tipo === "checkbox"
    );
    const completedControls = checkboxControls.filter(
      (control) => control.valor === "true"
    );

    return {
      total: checkboxControls.length,
      completed: completedControls.length,
      percentage:
        checkboxControls.length === 0
          ? 0
          : Math.round(
              (completedControls.length / checkboxControls.length) * 100
            ),
    };
  };

  return {
    handleControlChange,
    getGroupedControls,
    getControlStats,
    control,
  };
};

export default useControles;
