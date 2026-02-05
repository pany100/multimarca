import { generatePdfManoDeObraSchema } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trabajosData } = await validateRequest(
      body,
      generatePdfManoDeObraSchema,
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lista de Mano de Obra</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #1976d2;
              text-align: center;
              margin-bottom: 20px;
            }
            .date {
              text-align: right;
              margin-bottom: 20px;
              font-style: italic;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Lista de Mano de Obra</h1>
          <div style="text-align: center; font-size: 12px; margin-bottom: 10px; color: #666;">Precios no incluyen IVA</div>
          <div class="date">
            Fecha: ${format(new Date(), "PPP", { locale: es })}
          </div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${trabajosData
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${getFormattedPrice(item.sellPrice ?? 0)}</td>
                </tr>
              `,
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
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ManoDeObra_${format(
          new Date(),
          "yyyy-MM-dd",
        )}.pdf"`,
      },
    });
  } catch (e) {
    const response = handleApiError(e);
    return response;
  }
}
