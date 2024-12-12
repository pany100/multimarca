import { Typography } from "@mui/material";
import { Fragment } from "react";

type ControlMecanico = {
  name: string;
  type: string;
  pdfName: string;
};

type ControlReparacion = {
  id: number;
  controlMecanico: ControlMecanico;
  valor: string;
  detalle: string;
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
        .filter((control) => control.valor !== "false" && control.valor !== "")
        .map((control) => (
          <Fragment key={control.id}>
            <Typography
              variant="body1"
              sx={{ color: "common.black", lineHeight: 1.1, maxWidth: 720 }}
            >
              -{" "}
              {control.controlMecanico.pdfName || control.controlMecanico.name}
              {control.controlMecanico.type === "texto" && (
                <>
                  {": "}
                  {control.valor}
                </>
              )}
            </Typography>
          </Fragment>
        ))}
    </div>
  );
}

export default ControlesRealizados;
