import Divider from "@mui/material/Divider";
import React, { Fragment } from "react";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";

import { Typography } from "@mui/material";
import { EstadoOrdenReparacion } from "@prisma/client";
import CarHeader from "./CarHeader";
import ControlesRealizados from "./ControlesRealizados";
import WorkDescription from "./WorkDescription";

type Props = {
  repair: any;
};

const setPageStyles = () => {
  return `
    @media print {
      @page {
        margin: 10mm;
      }
      .pagebreak {
        clear: both;
        page-break-after: always;
      }
    }
  `;
};

export const OrdenClientePdf = React.forwardRef<any, Props>(
  ({ repair }, ref) => {
    return (
      <div ref={ref}>
        <style>{setPageStyles()}</style>
        <PDFPage style={{ height: "auto" }}>
          <TemplateHeader />
          <Divider sx={{ borderColor: "common.black" }} />
          <CarHeader
            car={repair.auto}
            repair={repair}
            owner={repair.auto.owner}
          />
          <Divider sx={{ borderColor: "common.black" }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "common.black" }}
          >
            Observaciones de entrada
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "common.black", width: "90%", lineHeight: 1.1 }}
          >
            {JSON.parse(repair.observacionesEntrada || "[]").join(", ") || "-"}
          </Typography>
          <Divider sx={{ borderColor: "common.black" }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "common.black" }}
          >
            Observaciones del taller
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "common.black", width: "90%", lineHeight: 1.1 }}
          >
            {JSON.parse(repair.observacionesSalida || "[]").join(", ") || "-"}
          </Typography>
          <Divider sx={{ borderColor: "common.black" }} />
          {repair.estado !== EstadoOrdenReparacion.Presupuestado &&
            repair.controlesEnReparacion.filter(
              (control: any) =>
                control.valor !== "false" && control.valor !== false
            ).length > 0 && (
              <Fragment>
                <ControlesRealizados repair={repair} />
                <Divider sx={{ borderColor: "common.black" }} />
              </Fragment>
            )}
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "common.black" }}
          >
            Detalle de Trabajos
          </Typography>
          <WorkDescription repair={repair} />
          <Typography variant="body1" sx={{ color: "common.black", mt: 2 }}>
            {repair.estado === EstadoOrdenReparacion.Terminado &&
              repair.mecanicos.length > 0 &&
              (repair.mecanicos.length === 1
                ? `Realizó: ${repair.mecanicos[0].name}`
                : `Realizaron: ${repair.mecanicos
                    .map((m: any) => m.name)
                    .join(", ")}`)}
          </Typography>
          <Divider sx={{ borderColor: "common.black" }} />
          <Typography variant="body1" sx={{ color: "common.black" }}>
            {repair.estado === EstadoOrdenReparacion.Presupuestado
              ? "Presupuesto aproximado, valores al día, sin IVA, sujeto a desarme y re-ensamble."
              : "Detalle del trabajo, sin IVA"}
          </Typography>
        </PDFPage>
      </div>
    );
  }
);

OrdenClientePdf.displayName = "OrdenClientePdf";

export default OrdenClientePdf;
