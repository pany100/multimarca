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
};

type Props = {
  repair: {
    controlesEnReparacion: ControlReparacion[];
    detalleControles: string;
  };
};

function ControlesRealizados({ repair }: Props) {
  return (
    <div>
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", color: "common.black" }}
      >
        Controles Realizados
      </Typography>
      {repair.controlesEnReparacion
        .filter((control) => control.valor !== "false" && control.valor !== "")
        .sort((a: any, b: any) => {
          if (a.controlMecanico.ordenEnPdf === null) return 1;
          if (b.controlMecanico.ordenEnPdf === null) return -1;
          return (
            (a.controlMecanico.ordenEnPdf || 0) -
            (b.controlMecanico.ordenEnPdf || 0)
          );
        })
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
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", color: "common.black" }}
      >
        Trabajos Realizados
      </Typography>
      {JSON.parse(repair.detalleControles || "[]").map(
        (element: string, index: number) => (
          <Typography
            key={index}
            variant="body1"
            sx={{ color: "common.black", lineHeight: 1.1, maxWidth: 720 }}
          >
            - {element}
          </Typography>
        )
      )}
    </div>
  );
}

export default ControlesRealizados;
