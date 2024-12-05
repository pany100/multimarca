import Divider from "@mui/material/Divider";
import React from "react";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";

import { Typography } from "@mui/material";
import { EstadoOrdenReparacion } from "@prisma/client";
import CarHeader from "./CarHeader";
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
          <Divider sx={{ mt: 2, mb: 2, borderColor: "common.black" }} />
          <CarHeader
            car={repair.auto}
            repair={repair}
            owner={repair.auto.owner}
          />
          <Divider sx={{ mt: 2, mb: 2, borderColor: "common.black" }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "common.black" }}
          >
            Detalle de Trabajos
          </Typography>
          <WorkDescription repair={repair} />
          <Divider sx={{ mt: 4, borderColor: "common.black" }} />
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
