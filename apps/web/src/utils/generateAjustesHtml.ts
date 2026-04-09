import { ComprobanteCalculado } from "@/core/domain/services/comprobante-calculado.service";

const fmtAR = (n: number) => Number(n).toLocaleString("es-AR");

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

  if (ajustes.length > 0) {
    const efectivos = calculoVO.ajustesConMontoEfectivo.filter(
      (a) => !a.esInterno,
    );
    if (efectivos.length === 0) return "";

    const header = `
      <div class="TypographyBody1" style="margin-top: 15px; font-weight: bold;">
        Ajustes
      </div>
      <div></div>
    `;

    const rows = efectivos
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

    return header + rows;
  }

  // Legacy: no ajustesPrecio
  let html = "";

  if (Number(entity.incremento ?? 0) > 0) {
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

  return html;
}
