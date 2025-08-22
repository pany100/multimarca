import { getFormattedPrice } from "@/utils/fieldHelper";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const { stockData } = await request.json();

    // Launch a browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lista de Stock</title>
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
            .low-stock {
              background-color: #ffcccc !important;
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
          <h1>Lista de Stock</h1>
          <div class="date">
            Fecha: ${format(new Date(), "PPP", { locale: es })}
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Precio de compra</th>
                <th>Unidades</th>
                <th>Valor de reposición</th>
                <th>Rótulo</th>
                <th>Margen</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              ${stockData
                .map(
                  (item: any) => `
                <tr class="${
                  item.units < item.restockValue ? "low-stock" : ""
                }">
                  <td>${item.id}</td>
                  <td>${item.name}</td>
                  <td>${item.brand}</td>
                  <td>${getFormattedPrice(item.buyPrice)}</td>
                  <td>${item.units === null ? 0 : item.units}</td>
                  <td>${item.restockValue || ""}</td>
                  <td>${item.label || ""}</td>
                  <td>${item.markup || ""}</td>
                  <td>${item.proveedor?.name || ""}</td>
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
      landscape: true,
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

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Stock_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF" },
      { status: 500 }
    );
  }
}
