import { GenerateStockPdfDto } from "@/core/application/dto/stock.dto";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularPrecioVenta } from "@/utils/stock-pricing";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import puppeteer from "puppeteer";

export class GenerateStockPdfUseCase {
  async execute(dto: GenerateStockPdfDto) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lista de Stock</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 10px; color: #333; font-size: 11px; }
            h1 { color: #1976d2; text-align: center; margin-bottom: 10px; font-size: 18px; }
            .date { text-align: right; margin-bottom: 10px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; }
            th { background-color: #f2f2f2; font-weight: bold; white-space: nowrap; }
            td:nth-child(1) { width: 6%; }
            td:nth-child(2) { width: 34%; }
            td:nth-child(3) { width: 18%; }
            td:nth-child(4) { width: 14%; white-space: nowrap; }
            td:nth-child(5) { width: 14%; white-space: nowrap; }
            td:nth-child(6) { width: 14%; white-space: nowrap; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .low-stock { background-color: #ffcccc !important; }
            .footer { text-align: center; font-size: 10px; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Lista de Stock</h1>
          <div class="date">
            Fecha: ${format(new Date(), "PPP", { locale: es })}
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Unidades en stock</th>
              </tr>
            </thead>
            <tbody>
              ${dto.stockData
                .map(
                  (item: any) => `
                <tr class="${item.units < item.restockValue ? "low-stock" : ""}">
                  <td>${item.id}</td>
                  <td>${item.name}</td>
                  <td>${item.proveedor?.name || ""}</td>
                  <td>${getFormattedPrice(item.buyPrice)}</td>
                  <td>${getFormattedPrice(calcularPrecioVenta(item.buyPrice, item.markup, item.sellIva) ?? 0)}</td>
                  <td>${item.units === null ? 0 : item.units}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            Multimarca - Generado el ${format(new Date(), "PPP 'a las' HH:mm", {
              locale: es,
            })}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "Legal",
      landscape: false,
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();
    return pdfBuffer;
  }
}

