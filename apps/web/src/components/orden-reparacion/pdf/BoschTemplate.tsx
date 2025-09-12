import { styled } from "@mui/material/styles";
import React from "react";
import PDFPage from "./PDFPage";

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

const Header = styled("div")(() => ({
  backgroundColor: "#387BBB",
  color: "white",
  padding: "10px",
  fontSize: "20px",
  fontWeight: "bold",
  marginTop: "50px",
}));

const SectionHeader = styled("div")(() => ({
  backgroundColor: "#A4C3D5",
  marginTop: "25px",
  display: "grid",
  gridTemplateColumns: "400px auto",
  height: "35px",
  alignItems: "center",
  paddingLeft: "60px",
}));

const SectionText = styled("div")(() => ({
  color: "#434342",
}));

const CarInfo = styled("div")(() => ({
  marginTop: "5px",
  fontSize: "13px",
  marginBottom: "10px",
}));

const CarInfoLine = styled("div")(() => ({
  borderBottom: "1px solid black",
  width: "100%",
}));

const CarInfoDoubleColumn = styled("div")(() => ({
  borderBottom: "1px solid black",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "460px auto",
}));

const KilometerAndDate = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "auto auto",
  justifyContent: "space-between",
}));

const DatePart = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "auto auto auto",
  gridGap: "20px",
  paddingRight: "50px",
}));

const CarInfoFourColumn = styled("div")(() => ({
  borderBottom: "1px solid black",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "260px 200px auto auto",
}));

const Section = styled("div")(() => ({
  backgroundColor: "#A4C3D5",
  textAlign: "center",
}));

const WhiteLine = styled("div")(() => ({
  backgroundColor: "white",
  height: "16px",
}));

const LightLine = styled("div")(() => ({
  backgroundColor: "#E6F3FF",
  height: "16px",
}));

const List = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "auto",
  gap: "1px",
  marginTop: "5px",
  marginBottom: "5px",
}));

const Item = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "auto auto",
  justifyContent: "left",
  alignItems: "center",
}));

const EmptyCell = styled("div")(() => ({
  width: "200px",
  border: "1px solid black",
  height: "15px",
}));

const CellText = styled("div")(() => ({
  fontSize: "10px",
}));

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        alignItems: "center",
        justifyContent: "left",
        gap: "4px",
      }}
    >
      <EmptyCell />
      <CellText>{children}</CellText>
    </div>
  );
}

const BoschTemplate = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref}>
      <style>{setPageStyles()}</style>
      <PDFPage
        style={{
          height: "auto",
          position: "relative",
        }}
      >
        <Header>
          <div>Tu taller de confianza</div>
        </Header>
        <img
          style={{
            width: "100px",
            position: "absolute",
            top: "12px",
            right: "50px",
          }}
          alt="bosch-icon"
          src="/bosch-icon.svg"
        />
        <SectionHeader>
          <SectionText>Checklist</SectionText>
          <SectionText>Orden de trabajo Nº:</SectionText>
        </SectionHeader>
        <CarInfo>
          <CarInfoLine>Nombre del cliente:</CarInfoLine>
          <CarInfoDoubleColumn>
            <div>Dirección:</div>
            <div>Preferencias de pago:</div>
          </CarInfoDoubleColumn>
          <CarInfoLine>Teléfonos:</CarInfoLine>
          <CarInfoLine>E-mail:</CarInfoLine>
          <CarInfoFourColumn>
            <div>Vehículo marca:</div>
            <div>Modelo:</div>
            <div>Año:</div>
            <div>Kilómetros:</div>
          </CarInfoFourColumn>
          <CarInfoLine>Patente:</CarInfoLine>
          <CarInfoDoubleColumn>
            <div>Fecha de entrada:</div>
            <div>Próximo servicio:</div>
          </CarInfoDoubleColumn>
        </CarInfo>
        <Section>
          <SectionText>Marcas y detalles sobre carrocería</SectionText>
        </Section>
        <img
          style={{
            width: "100%",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
          alt="bosch-carroceria"
          src="/bosch-carroceria.jpeg"
        />
        <Section>
          <SectionText>Observaciones (accesorios)*</SectionText>
        </Section>
        <CarInfo>
          <CarInfoDoubleColumn>
            <div>TUERCA A/R: </div>
            <div>HECHO EN MT:</div>
          </CarInfoDoubleColumn>
          <CarInfoDoubleColumn>
            <div>CÉDULA (FOTO F Y D) QUEDA EN:</div>
            <KilometerAndDate>
              <div>SERVICE DE MOTOR:</div>
              <DatePart>
                <div>km-</div>
                <div>/</div>
                <div>/</div>
              </DatePart>
            </KilometerAndDate>
          </CarInfoDoubleColumn>
          <CarInfoDoubleColumn>
            <div>SEGURO, QUEDA EN:</div>
            <KilometerAndDate>
              <div>DISTRIBUCIÓN:</div>
              <DatePart>
                <div>km-</div>
                <div>/</div>
                <div>/</div>
              </DatePart>
            </KilometerAndDate>
          </CarInfoDoubleColumn>
          <CarInfoDoubleColumn>
            <div>COLOR:</div>
            <KilometerAndDate>
              <div>ACEITE DE CAJA:</div>
              <DatePart>
                <div>km-</div>
                <div>/</div>
                <div>/</div>
              </DatePart>
            </KilometerAndDate>
          </CarInfoDoubleColumn>
          <CarInfoLine>TRANSMISIÓN:</CarInfoLine>
        </CarInfo>
        <Section>
          <SectionText>
            Servicios solicitados (inspección / mantenimiento / reparación)
          </SectionText>
        </Section>
        <CarInfoLine>Cliente solicita turno por:</CarInfoLine>
        <LightLine />
        <WhiteLine />
        <LightLine />
        <WhiteLine />
        <LightLine />
        <WhiteLine />
        <LightLine />
        <WhiteLine />
        <LightLine />
        <WhiteLine />
        <LightLine />
        <Section>
          <SectionText>Checklist Rápido</SectionText>
        </Section>
        <List>
          <Item>
            <img
              style={{
                paddingLeft: "20px",
                paddingRight: "20px",
                width: "250px",
              }}
              alt="bosch-costado1"
              src="/costado-1.png"
            />
            <div>
              <Cell>Aire acondicionado / climatizador</Cell>
              <Cell>Bocina (funcionamiento)</Cell>
              <Cell>Panel de instrumentos (funcionamiento/iluminación)</Cell>
              <Cell>Cinturones de seguridad (funcionamiento/fijaciones)</Cell>
              <Cell>Sistema de iluminación (interior/exterior)</Cell>
              <Cell>Lectura de memorias averías (scanner)</Cell>
            </div>
          </Item>
          <Item>
            <img
              style={{
                paddingLeft: "20px",
                paddingRight: "20px",
                width: "250px",
              }}
              alt="bosch-costado2"
              src="/costado-2.png"
            />
            <div>
              <Cell>Escobillas delanteras (control)</Cell>
              <Cell>Escobillas traseras (control)</Cell>
              <Cell>Neumáticos (estado)</Cell>
              <Cell>Neumático Auxiliar (herramientas del vehículo)</Cell>
            </div>
          </Item>
          <Item>
            <div style={{ width: "250px", textAlign: "right" }}>
              <img
                style={{
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  width: "120px",
                }}
                alt="frente"
                src="/frente.png"
              />
            </div>
            <div>
              <Cell>Líquido refrigerante (nivel/aditivo)</Cell>
              <Cell>Líquido de freno (nivel/calidad)</Cell>
              <Cell>Nivel de aceite</Cell>
              <Cell>Líquido hidráulico</Cell>
              <Cell>Líquido limpiaparabrisas</Cell>
            </div>
          </Item>
        </List>
        <Section>
          <SectionText>Conformidad Cliente</SectionText>
        </Section>
        <CarInfoDoubleColumn style={{ marginTop: "10px" }}>
          <div>Nombre:</div>
          <div>Firma:</div>
        </CarInfoDoubleColumn>
      </PDFPage>
    </div>
  );
});

BoschTemplate.displayName = "BoschTemplatePdf";

export default BoschTemplate;
