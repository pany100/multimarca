import Divider from "@mui/material/Divider";
import React from "react";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";

import { Typography } from "@mui/material";
import CarHeader from "./CarHeader";
import ServiceHeader from "./ServiceHeader";
import WorkDescription from "./WorkDescription";

type Props = {
  repair: any;
};

const setPageStyles = () => {
  return "@media print {.pagebreak {clear: both; page-break-after: always; }}";
};

export const OrdenClientePdf = React.forwardRef<any, Props>(
  ({ repair }, ref) => {
    return (
      <div ref={ref}>
        <style>{setPageStyles()}</style>
        <PDFPage>
          <TemplateHeader />
          <CarHeader car={repair.auto} owner={repair.auto.owner} />
          <ServiceHeader repair={repair} />
          <Divider sx={{ mt: 4, borderColor: "common.black" }} />
          <Typography variant="body1" sx={{ color: "common.black" }}>
            Observación del cliente
          </Typography>
          <Typography variant="body1" sx={{ color: "common.black", mb: 10 }}>
            {repair.observacionesCliente}
          </Typography>
          <Typography variant="body1" sx={{ color: "common.black" }}>
            Trabajos realizados
          </Typography>
          {repair.trabajosRealizados.map((el: { descripcion: string }) => (
            <Typography
              variant="body1"
              sx={{ color: "common.black" }}
              key={el.descripcion}
            >
              {el.descripcion}
            </Typography>
          ))}
          <Divider sx={{ mt: 4, borderColor: "common.black" }} />
          <Typography variant="body1" sx={{ color: "common.black" }}>
            Detalle de Trabajos
          </Typography>
          <WorkDescription repair={repair} />
          <Divider sx={{ mt: 4, borderColor: "common.black" }} />
          <Typography variant="body1" sx={{ color: "common.black" }}>
            Realizó {repair.mecanicos[0]?.name}
          </Typography>
        </PDFPage>
      </div>
    );
  }
);

OrdenClientePdf.displayName = "OrdenClientePdf";

export default OrdenClientePdf;
