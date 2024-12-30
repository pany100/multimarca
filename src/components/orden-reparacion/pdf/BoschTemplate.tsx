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

const BoschTemplate = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref}>
      <style>{setPageStyles()}</style>
      <PDFPage style={{ height: "auto" }}>
        <div>HOLA</div>
      </PDFPage>
    </div>
  );
});

BoschTemplate.displayName = "BoschTemplatePdf";

export default BoschTemplate;
