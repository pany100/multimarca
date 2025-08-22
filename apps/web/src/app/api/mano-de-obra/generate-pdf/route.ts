import { getFormattedPrice } from "@/utils/fieldHelper";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const { trabajosData } = await request.json();

    // Launch a browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML content for the PDF
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
          <div class="date">
            Fecha: ${format(new Date(), "PPP", { locale: es })}
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${trabajosData
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.name}</td>
                  <td>${getFormattedPrice(item.sellPrice)}</td>
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

    // Set the HTML content
    await page.setContent(htmlContent);

    // Generate PDF
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

    // Close the browser
    await browser.close();

    // Return the PDF as a response - convert Buffer to Uint8Array for compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ManoDeObra_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(JSON.stringify({ error: "Error generating PDF" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
