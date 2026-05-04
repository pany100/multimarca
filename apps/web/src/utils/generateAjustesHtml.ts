import { ComprobanteCalculado } from "@/core/domain/services/comprobante-calculado.service";

const fmtAR = (n: number) =>
  Number(n).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Generates the HTML rows for the ajustes section in the PDF.
 * Uses calculoVO to get the effective amounts (important for % ajustes).
 * For legacy data (no ajustesPrecio), shows incremento/descuento as before.
 */
export function generateAjustesRowsHtml(
  entity: any,
  calculoVO: ComprobanteCalculado,
): string {
  const ajustes = entity.ajustesPrecio ?? [];

  let html = "";
  let hasContent = false;

  // New ajustes (non-internal only)
  if (ajustes.length > 0) {
    const efectivos = calculoVO.ajustesConMontoEfectivo.filter(
      (a) => !a.esInterno,
    );
    if (efectivos.length > 0) {
      hasContent = true;
      html += efectivos
        .map((a) => {
          const sign = a.esDescuento ? "-" : "+";
          const montoAbsoluto = Math.abs(a.montoEfectivo);
          const label =
            a.tipo === "porcentual"
              ? `${a.descripcion} (${a.montoOriginal}%)`
              : a.descripcion;

          return `
          <div class="TypographyBody1" style="margin-top: 5px; padding-left: 10px;">
            ${label}
          </div>
          <div class="TypographyBody1" style="margin-top: 5px; text-align: right;">
            ${sign} $${fmtAR(montoAbsoluto)}
          </div>
        `;
        })
        .join("");
    }
  }

  // Legacy fields (always shown if they have value)
  if (Number(entity.incremento ?? 0) > 0) {
    hasContent = true;
    const label = entity.descripcionIncremento
      ? `Otros - ${entity.descripcionIncremento}`
      : "Otros";
    html += `
      <div class="TypographyBody1" style="margin-top: 10px;">
        ${label}
      </div>
      <div class="TypographyBody1" style="margin-top: 10px; text-align: right;">
        + $${fmtAR(Number(entity.incremento))}
      </div>
    `;
  }

  if (Number(entity.descuento ?? 0) > 0) {
    hasContent = true;
    const label = entity.descripcionDescuento
      ? `Descuento - ${entity.descripcionDescuento}`
      : "Descuento";
    html += `
      <div class="TypographyBody1" style="margin-top: 10px;">
        ${label}
      </div>
      <div class="TypographyBody1" style="margin-top: 10px; text-align: right;">
        - $${fmtAR(Number(entity.descuento))}
      </div>
    `;
  }

  if (!hasContent) return "";

  const header = `
    <div class="TypographyBody1" style="margin-top: 15px; font-weight: bold;">
      Ajustes
    </div>
    <div></div>
  `;

  return header + html;
}
