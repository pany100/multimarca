import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const { weekData } = await request.json();

    // Launch a browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Get the dates for the week
    const startDate = startOfWeek(new Date(weekData[0]?.fecha || new Date()), {
      weekStartsOn: 1,
    }); // Start on Monday
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i)); // Monday to Friday

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Agenda Semanal</title>
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
              font-size: 12px;
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
            .day-header {
              background-color: #1976d2;
              color: white;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Agenda Semanal</h1>
          <div class="date">
            Semana del ${format(weekDays[0], "PPP", { locale: es })}
          </div>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Patente</th>
                <th>Descripción</th>
                ${weekDays
                  .map(
                    (day) => `
                  <th class="day-header">${format(day, "EEEE d", {
                    locale: es,
                  })}</th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${weekData
                .map((turno: any) => {
                  const turnoDate = new Date(turno.fecha);
                  const dayIndex = weekDays.findIndex(
                    (d) => d.toDateString() === turnoDate.toDateString()
                  );

                  return `
                <tr>
                  <td>${turno.auto.owner.fullName}</td>
                  <td>${turno.auto.patent}</td>
                  <td>${turno.problema}</td>
                  ${weekDays
                    .map((_, index) =>
                      index === dayIndex
                        ? `<td>${format(new Date(turno.hora), "HH:mm")}</td>`
                        : "<td></td>"
                    )
                    .join("")}
                </tr>
              `;
                })
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
        "Content-Disposition": `attachment; filename="Agenda_Semanal_${format(
          weekDays[0],
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
