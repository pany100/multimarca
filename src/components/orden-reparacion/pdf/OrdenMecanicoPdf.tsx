import { Typography } from "@mui/material";
import React from "react";
import CompleteLine from "./CompleteLine";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";
import TextWithBlackBackground from "./TextWithBlackBackground";
import TextWithFillLine from "./TextWithFillLine";

import Checkbox from "@mui/material/Checkbox";

import { styled } from "@mui/material/styles";

const CheckTypeControlsTwoColumns = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "50% 50%",
  width: "100%",
}));

type Props = {
  repair: any;
};

const setPageStyles = () => `
  @media print {
    .pagebreak { page-break-before: always; }
    @page { margin: 0; }
    body { margin: 0; }
    div { page-break-inside: avoid; }
  }
`;

export const OrdenMecanicoPdf = React.forwardRef<any, Props>(
  ({ repair }, ref) => {
    return (
      <div ref={ref}>
        <style>{setPageStyles()}</style>
        <PDFPage style={{ height: "297mm" }}>
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
              marginBottom: 30,
            }}
          >
            <div>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Fecha: {repair.fechaCreacion}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Titular: {repair.auto.owner.fullName}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Vehículo: {repair.auto.brand} {repair.auto.model}
              </Typography>
              <div>
                <Typography
                  variant="h6"
                  sx={{ color: "common.black", textTransform: "uppercase" }}
                >
                  Motivos
                </Typography>
                <Typography sx={{ color: "common.black" }}>
                  {repair.observacionesCliente}
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Patente: {repair.auto.patent}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Teléfono: {repair.auto.owner.phone}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Km: {repair.kilometros}
              </Typography>
              <div>
                <Typography
                  variant="h6"
                  sx={{ color: "common.black", textTransform: "uppercase" }}
                >
                  Historia
                </Typography>
                {JSON.parse(repair.observacionesEntrada).length > 0 &&
                  JSON.parse(repair.observacionesEntrada).map((el: string) => (
                    <Typography
                      key={el.toString()}
                      sx={{ color: "common.black" }}
                    >
                      * {el}
                    </Typography>
                  ))}
              </div>
            </div>
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
              {[...Array(30)].map((el, index) => (
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
              {[...Array(30)].map((el, index) => (
                <CompleteLine key={index} />
              ))}
            </div>
          </div>
        </PDFPage>
        <PDFPage style={{ height: "297mm" }}>
          <div
            style={{
              marginBottom: 10,
              overflow: "hidden",
              height: 170,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "common.black", textTransform: "uppercase" }}
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
                    e.controlMecanico.name.length <= 20
                )
                .map(
                  (el: {
                    id: string;
                    controlMecanico: { type: string; name: string };
                  }) => (
                    <div key={el.id}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "common.black",
                          textTransform: "uppercase",
                          fontSize: 18,
                          lineHeight: "30px",
                        }}
                      >
                        * {el.controlMecanico.name}
                        <Checkbox sx={{ color: "common.black", pt: 0 }} />
                      </Typography>
                    </div>
                  )
                )}
            </CheckTypeControlsTwoColumns>
            <div>
              {repair.controlesEnReparacion
                .filter(
                  (e: { controlMecanico: { type: string; name: string } }) =>
                    e.controlMecanico.type === "checkbox" &&
                    e.controlMecanico.name.length > 20
                )
                .map(
                  (el: {
                    id: string;
                    controlMecanico: { type: string; name: string };
                  }) => (
                    <div key={el.id}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "common.black",
                          textTransform: "uppercase",
                          fontSize: 18,
                          lineHeight: "30px",
                        }}
                      >
                        * {el.controlMecanico.name}
                        <Checkbox sx={{ color: "common.black", pt: 0 }} />
                      </Typography>
                    </div>
                  )
                )}
              {repair.controlesEnReparacion
                .filter(
                  (e: { controlMecanico: { type: string } }) =>
                    e.controlMecanico.type === "text"
                )
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
                    >{`* ${el.controlMecanico.name}`}</TextWithFillLine>
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
