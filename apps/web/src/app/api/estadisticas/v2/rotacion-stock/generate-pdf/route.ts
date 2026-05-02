import { generatePdfRotacionStockSchema } from "@/core/infrastructure/validation/schemas/rotacion-stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function colorPromedio(dias: number | null): string {
  if (dias == null) return "#9e9e9e";
  if (dias < 180) return "#2e7d32";
  if (dias <= 365) return "#ed6c02";
  return "#d32f2f";
}

function colorInactividad(dias: number | null): string {
  if (dias == null || dias >= 365) return "#d32f2f";
  if (dias >= 180) return "#ed6c02";
  if (dias >= 90) return "#bf6c00";
  return "#333";
}

function fmtDias(dias: number | null): string {
  if (dias == null) return "Sin movimiento";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kpis, productos } = await validateRequest(
      body,
      generatePdfRotacionStockSchema,
    );

    const fechaGen = format(new Date(), "PPP 'a las' HH:mm", { locale: es });

    const filas = productos
      .map((p) => {
        const semaforo = colorPromedio(p.diasPromedioStock);
        const inactivoColor = colorInactividad(p.diasDesdeUltimoMovimiento);
        return `
          <tr>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${escapeHtml(p.marca || "-")}</td>
            <td>${escapeHtml(p.proveedor ?? "-")}</td>
            <td>${escapeHtml(p.sector ?? "-")}</td>
            <td class="num">${Number(p.stockActual).toFixed(2)}</td>
            <td class="num">${Number(p.unidadesVendidas365).toFixed(2)}</td>
            <td class="num" style="color:${semaforo};font-weight:600;">
              ${p.diasPromedioStock == null ? "—" : `${p.diasPromedioStock}d`}
            </td>
            <td class="num" style="color:${inactivoColor};font-weight:600;">
              ${fmtDias(p.diasDesdeUltimoMovimiento)}
            </td>
          </tr>`;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rotación de stock</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #1976d2; margin: 0 0 4px 0; }
            .date { font-size: 12px; color: #666; margin-bottom: 16px; }
            .description { font-size: 11px; color: #555; margin-bottom: 16px; line-height: 1.4; }
            .kpis { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
            .kpi { flex: 1; min-width: 120px; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; }
            .kpi .label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
            .kpi .value { font-size: 22px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 5px 6px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) td { background: #fafafa; }
            td.num { text-align: right; }
            .footer { text-align: center; font-size: 10px; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Rotación de stock</h1>
          <div class="date">Generado el ${fechaGen}</div>
          <div class="description">
            Días promedio en stock = (Stock actual × 365) ÷ Unidades vendidas en los últimos 365 días.
            Los buckets de inactividad son acumulativos: ≥90 incluye a ≥180 y ≥365.
          </div>

          <div class="kpis">
            <div class="kpi">
              <div class="label">Días prom. stock</div>
              <div class="value">${kpis.diasPromedioStockGlobal}</div>
            </div>
            <div class="kpi">
              <div class="label">Productos con stock</div>
              <div class="value">${kpis.totalProductosConStock}</div>
            </div>
            <div class="kpi" style="border-color:#bf6c00;">
              <div class="label">Sin mov. ≥ 90 días</div>
              <div class="value" style="color:#bf6c00;">${kpis.productosSinMov90}</div>
            </div>
            <div class="kpi" style="border-color:#ed6c02;">
              <div class="label">Sin mov. ≥ 180 días</div>
              <div class="value" style="color:#ed6c02;">${kpis.productosSinMov180}</div>
            </div>
            <div class="kpi" style="border-color:#d32f2f;">
              <div class="label">Sin mov. ≥ 365 días</div>
              <div class="value" style="color:#d32f2f;">${kpis.productosSinMov365}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Proveedor</th>
                <th>Sector</th>
                <th>Stock</th>
                <th>Vend. 365d</th>
                <th>Días prom.</th>
                <th>Sin mov.</th>
              </tr>
            </thead>
            <tbody>
              ${filas || `<tr><td colspan="8" style="text-align:center;color:#666;">Sin productos</td></tr>`}
            </tbody>
          </table>

          <div class="footer">
            Multimarca — Rotación de stock generada el ${fechaGen}
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    await browser.close();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RotacionStock_${format(new Date(), "yyyy-MM-dd")}.pdf"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
