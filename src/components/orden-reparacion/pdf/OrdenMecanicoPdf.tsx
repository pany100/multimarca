import { Typography } from "@mui/material";
import React from "react";
import CompleteLine from "./CompleteLine";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";
import TextWithBlackBackground from "./TextWithBlackBackground";
import TextWithFillLine from "./TextWithFillLine";

import Checkbox from "@mui/material/Checkbox";

import { getFormattedControlName } from "@/utils/fieldHelper";
import { styled } from "@mui/material/styles";

const CheckTypeControlsTwoColumns = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "50% 50%",
  width: "730px",
}));

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

const MAX_CONTROL_LENGTH = 24;

function sortControls(a: any, b: any) {
  if (a.controlMecanico.ordenEnPdf === null) return 1;
  if (b.controlMecanico.ordenEnPdf === null) return -1;
  return (
    (a.controlMecanico.ordenEnPdf || 0) - (b.controlMecanico.ordenEnPdf || 0)
  );
}

export const OrdenMecanicoPdf = React.forwardRef<any, Props>(
  ({ repair }, ref) => {
    return (
      <div ref={ref}>
        <style>{setPageStyles()}</style>
        <PDFPage style={{ height: "auto" }}>
          <TemplateHeader />
          <div style={{ marginBottom: 30 }}>
            <Typography
              variant="h6"
              sx={{ color: "common.black", textTransform: "uppercase" }}
            >
              Orden Reparación Nro: {repair.id}
            </Typography>
          </div>
          <TextWithBlackBackground>
            Colocar cubrevolante, cubreasiento
          </TextWithBlackBackground>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "45% 50%",
              gridGap: "5%",
              marginBottom: 15,
            }}
          >
            <div>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Fecha:{" "}
                {new Date(repair.fechaCreacion).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Titular: {repair.auto.owner.fullName}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Vehículo: {repair.auto.brand} {repair.auto.model}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Válvulas: {repair.auto.valves}
              </Typography>
            </div>
            <div>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Patente: {repair.auto.patent}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Teléfono: {repair.auto.owner.phone}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Km: {repair.kilometros?.toLocaleString("es-AR")}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Transmisión: {repair.auto.transmission_type}
              </Typography>
            </div>
          </div>
          <div style={{ marginBottom: 15 }}>
            <Typography
              variant="h6"
              sx={{ color: "common.black", textTransform: "uppercase" }}
            >
              Motivos:
            </Typography>
            <Typography sx={{ color: "common.black" }}>
              {repair.observacionesCliente || "-"}
            </Typography>
          </div>
          <div style={{ marginBottom: 15 }}>
            <Typography
              variant="h6"
              sx={{ color: "common.black", textTransform: "uppercase" }}
            >
              Historia
            </Typography>
            {JSON.parse(repair.observacionesEntrada).length > 0 &&
              JSON.parse(repair.observacionesEntrada).map((el: string) => (
                <Typography key={el.toString()} sx={{ color: "common.black" }}>
                  {el}
                </Typography>
              ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "55% 40%",
              gridGap: "5%",
              overflow: "hidden",
              flex: 1,
            }}
          >
            <div
              style={{
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "common.black", textTransform: "uppercase" }}
              >
                Trabajos Realizados
              </Typography>
              {[...Array(18)].map((el, index) => (
                <CompleteLine key={index} />
              ))}
            </div>
            <div
              style={{
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "common.black", textTransform: "uppercase" }}
              >
                Repuestos
              </Typography>
              {[...Array(18)].map((el, index) => (
                <CompleteLine key={index} />
              ))}
            </div>
          </div>
          <div
            style={{
              marginBottom: 10,
              overflow: "hidden",
              height: 170,
            }}
          >
            <Typography
              variant="h6"
              sx={{ mt: 4, color: "common.black", textTransform: "uppercase" }}
            >
              Observaciones
            </Typography>
            <CompleteLine />
            <CompleteLine />
            <CompleteLine />
            <CompleteLine />
          </div>
          <div
            style={{
              marginBottom: 30,
            }}
          >
            <TextWithBlackBackground>Controles</TextWithBlackBackground>
            <CheckTypeControlsTwoColumns>
              {repair.controlesEnReparacion
                .filter(
                  (e: { controlMecanico: { type: string; name: string } }) =>
                    e.controlMecanico.type === "checkbox" &&
                    getFormattedControlName(e.controlMecanico.name).length <=
                      MAX_CONTROL_LENGTH
                )
                .sort(sortControls)
                .map(
                  (el: {
                    id: string;
                    controlMecanico: { type: string; name: string };
                  }) => (
                    <Typography
                      variant="overline"
                      sx={{
                        color: "common.black",
                        textTransform: "uppercase",
                        fontSize: 18,
                        lineHeight: "30px",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                      key={el.id}
                    >
                      <span style={{ marginRight: "8px", flexShrink: 0 }}>
                        *
                      </span>
                      <span style={{ flex: 1 }}>
                        {getFormattedControlName(el.controlMecanico.name)}
                      </span>
                      <Checkbox sx={{ color: "common.black", pt: 0, ml: 1 }} />
                    </Typography>
                  )
                )}
            </CheckTypeControlsTwoColumns>
            <div style={{ width: "730px" }}>
              {repair.controlesEnReparacion
                .filter(
                  (e: {
                    controlMecanico: {
                      type: string;
                      name: string;
                      ordenEnPdf: number | null;
                    };
                  }) =>
                    e.controlMecanico.type === "checkbox" &&
                    getFormattedControlName(e.controlMecanico.name).length >
                      MAX_CONTROL_LENGTH
                )
                .sort((a: any, b: any) => {
                  if (a.controlMecanico.ordenEnPdf === null) return 1;
                  if (b.controlMecanico.ordenEnPdf === null) return -1;
                  return (
                    (a.controlMecanico.ordenEnPdf || 0) -
                    (b.controlMecanico.ordenEnPdf || 0)
                  );
                })
                .map(
                  (el: {
                    id: string;
                    controlMecanico: {
                      type: string;
                      name: string;
                      ordenEnPdf: number | null;
                    };
                  }) => (
                    <Typography
                      variant="overline"
                      sx={{
                        color: "common.black",
                        textTransform: "uppercase",
                        fontSize: 18,
                        lineHeight: "30px",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                      key={el.id}
                    >
                      <span style={{ marginRight: "8px", flexShrink: 0 }}>
                        *
                      </span>
                      <span style={{ flex: 1 }}>
                        {getFormattedControlName(el.controlMecanico.name)}
                      </span>
                      <Checkbox
                        sx={{
                          color: "common.black",
                          pt: 0,
                          mr: 1,
                          height: 24,
                          width: 24,
                        }}
                      />
                    </Typography>
                  )
                )}
              {repair.controlesEnReparacion
                .filter(
                  (e: { controlMecanico: { type: string } }) =>
                    e.controlMecanico.type !== "checkbox"
                )
                .sort((a: any, b: any) => {
                  if (a.controlMecanico.ordenEnPdf === null) return 1;
                  if (b.controlMecanico.ordenEnPdf === null) return -1;
                  return (
                    (a.controlMecanico.ordenEnPdf || 0) -
                    (b.controlMecanico.ordenEnPdf || 0)
                  );
                })
                .map(
                  (el: {
                    id: string;
                    controlMecanico: { type: string; name: string };
                  }) => (
                    <TextWithFillLine
                      key={el.controlMecanico.name}
                      variant="overline"
                      sx={{
                        color: "common.black",
                        textTransform: "uppercase",
                        fontSize: 18,
                        lineHeight: "30px",
                      }}
                    >{`* ${getFormattedControlName(
                      el.controlMecanico.name
                    )}`}</TextWithFillLine>
                  )
                )}
            </div>
          </div>
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <TextWithBlackBackground>
              Colocar cubrevolante, cubreasiento
            </TextWithBlackBackground>
          </div>
          <TextWithFillLine>Realizado Por</TextWithFillLine>
        </PDFPage>
      </div>
    );
  }
);

OrdenMecanicoPdf.displayName = "OrdenMecanicoPdf";
