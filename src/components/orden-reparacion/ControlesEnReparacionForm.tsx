import { Checkbox, TextField } from "@mui/material";
import React from "react";
import { useFormContext } from "react-hook-form";

type ControlMecanico = {
  id: number;
  nombre: string;
  tipo: "checkbox" | "texto";
  valor: string;
};

type Props = {
  controlesMecanicos: ControlMecanico[];
};

const ControlesEnReparacionForm: React.FC<Props> = ({ controlesMecanicos }) => {
  const { control, getValues, setValue } = useFormContext();

  const handleControlChange = (id: number, valor: string) => {
    const controlesEnReparacion = getValues("controlesEnReparacion");
    console.log(controlesEnReparacion);
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

  return (
    <div>
      {controlesMecanicos.map((control) => {
        return (
          <div key={control.id}>
            <label>{control.nombre}</label>
            {control.tipo === "checkbox" ? (
              <Checkbox
                defaultChecked={control?.valor === "true"}
                onChange={(e) =>
                  handleControlChange(
                    control.id,
                    e.target.checked ? "true" : "false"
                  )
                }
              />
            ) : (
              <TextField
                defaultValue={control?.valor || ""}
                onBlur={(e) => handleControlChange(control.id, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ControlesEnReparacionForm;
