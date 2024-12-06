import { Typography } from "@mui/material";

type ControlMecanico = {
  name: string;
  type: string;
};

type ControlReparacion = {
  id: number;
  controlMecanico: ControlMecanico;
  valor: string;
};

type Props = {
  repair: {
    controlesEnReparacion: ControlReparacion[];
  };
};

function ControlesRealizados({ repair }: Props) {
  return (
    <div>
      <Typography variant="h6" sx={{ color: "common.black" }}>
        Controles Realizados
      </Typography>
      {repair.controlesEnReparacion
        .filter((control) => control.valor === "true")
        .map((control) => (
          <Typography
            variant="body1"
            sx={{ color: "common.black" }}
            key={control.id}
          >
            {control.controlMecanico.name}
          </Typography>
        ))}
    </div>
  );
}

export default ControlesRealizados;
