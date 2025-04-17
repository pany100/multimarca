import Divider from "@mui/material/Divider";
import React from "react";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";

import CarHeader from "./CarHeader";
import DetallesOrdenInterna from "./DetallesOrdenInterna";
import OrdenInternaTotal from "./OrdenInternaTotal";

type Props = {
  repair: any;
};

const setPageStyles = () => {
  return `
        margin: 10mm;
      }
      .pagebreak {
        clear: both;
        page-break-after: always;
      }
    }
  `;
};

export const OrdenClienteInterna = React.forwardRef<any, Props>(
  ({ repair }, ref) => {
    return (
      <div ref={ref}>
        <style>{setPageStyles()}</style>
        <PDFPage style={{ height: "auto" }}>
          <TemplateHeader />
          <Divider sx={{ mt: 2, mb: 2, borderColor: "common.gray" }} />
          <CarHeader
            car={repair.auto}
            repair={repair}
            owner={repair.auto.owner}
          />
          <Divider sx={{ mt: 2, mb: 2, borderColor: "common.gray" }} />
          <OrdenInternaTotal repair={repair} />
          <Divider sx={{ mt: 2, mb: 2, borderColor: "common.gray" }} />
          <DetallesOrdenInterna />
        </PDFPage>
      </div>
    );
  }
);

OrdenClienteInterna.displayName = "OrdenClienteInterna";

export default OrdenClienteInterna;
