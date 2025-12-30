import { Typography } from "@mui/material";
import React from "react";
import CompleteLine from "./CompleteLine";
import PDFPage from "./PDFPage";
import TemplateHeader from "./TemplateHeader";
import TextWithBlackBackground from "./TextWithBlackBackground";
import TextWithFillLine from "./TextWithFillLine";

import Checkbox from "@mui/material/Checkbox";

import useControles from "@/hooks/orden-reparacion/useControles";
import { getFormattedDate } from "@/utils/fieldHelper";
import { styled } from "@mui/material/styles";

const CheckTypeControlsTwoColumns = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "50% 50%",
}));

const GroupContainer = styled("div")(() => ({
  border: "1px solid black",
  borderRadius: "4px",
  marginTop: "10px",
  marginBottom: "10px",
  width: "98%",
  padding: "10px",
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
    const { checkControls, textControls, groupControls } = useControles({
      controlesList: repair.controlesEnReparacion.map(
        (control: any) => control.controlMecanico
      ),
    });
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "10px",
              marginBottom: 30,
            }}
          >
            <div
              style={{
                marginTop: 0,
                marginRight: "auto",
                marginLeft: 0,
                padding: 10,
                backgroundColor: "black",
              }}
            >
              <Typography variant="h6" sx={{ color: "common.white" }}>
                Colocar cubrevolante, cubreasiento
              </Typography>
            </div>
            <TextWithFillLine sx={{ alignSelf: "center" }}>
              EN PROCESO CON
            </TextWithFillLine>
          </div>
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
                Fecha: {getFormattedDate(repair.fechaCreacion)}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Titular: {repair.auto.owner.fullName}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Vehículo: {repair.auto.brand} {repair.auto.model}
              </Typography>
              <Typography variant="h6" sx={{ color: "common.black" }}>
                Motor: {repair.auto.valves || "....... / ....... V"}
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
            {repair.observacionesEntrada &&
              JSON.parse(repair.observacionesEntrada).length > 0 &&
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
              {checkControls.map((control) => (
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
                  key={control.id}
                >
                  <span style={{ marginRight: "8px", flexShrink: 0 }}>*</span>
                  <span style={{ flex: 1 }}>{control.name}</span>
                  <Checkbox sx={{ color: "common.black", pt: 0, ml: 1 }} />
                </Typography>
              ))}
            </CheckTypeControlsTwoColumns>
            <div>
              {groupControls.map((control) => (
                <GroupContainer
                  sx={{
                    color: "common.black",
                    textTransform: "uppercase",
                    fontSize: 18,
                    lineHeight: "30px",
                  }}
                  key={control.name}
                >
                  {`${control.name}`}
                  <CheckTypeControlsTwoColumns sx={{ mt: 2 }}>
                    {control.controls
                      .filter((control: any) => control.type === "checkbox")
                      .map((control: any) => (
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
                          key={control.id}
                        >
                          <span style={{ marginRight: "8px", flexShrink: 0 }}>
                            *
                          </span>
                          <span style={{ flex: 1 }}>{control.name}</span>
                          <Checkbox
                            sx={{ color: "common.black", pt: 0, ml: 1 }}
                          />
                        </Typography>
                      ))}
                  </CheckTypeControlsTwoColumns>
                </GroupContainer>
              ))}
            </div>
            <div>
              {textControls.map((control) => (
                <TextWithFillLine
                  key={control.id}
                  variant="overline"
                  sx={{
                    color: "common.black",
                    textTransform: "uppercase",
                    fontSize: 18,
                    lineHeight: "30px",
                  }}
                >
                  {`* ${control.name}`}
                </TextWithFillLine>
              ))}
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
          <TextWithFillLine>Revisado Por</TextWithFillLine>
        </PDFPage>
      </div>
    );
  }
);

OrdenMecanicoPdf.displayName = "OrdenMecanicoPdf";
