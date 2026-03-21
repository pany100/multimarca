import prisma from "@/lib/prisma";
import { sortTurnosByDayAndHora } from "@/lib/sortTurnosForWeekExport";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const { nextWeek } = await request.json();

    // Launch a browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Get the dates for the week
    let startDate = startOfWeek(new Date(), {
      weekStartsOn: 1, // Start on Monday
    });

    if (nextWeek) {
      startDate = addDays(startDate, 7);
    }

    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i)); // Monday to Friday

    // Fetch feriados for the week
    const feriados = await prisma.feriado.findMany({
      where: {
        fecha: {
          gte: weekDays[0],
          lte: weekDays[4],
        },
      },
    });

    // Fetch turnos for the week
    const turnosRaw = await prisma.turno.findMany({
      where: {
        fecha: {
          gte: weekDays[0],
          lte: weekDays[4],
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    const turnos = sortTurnosByDayAndHora(turnosRaw);

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
              margin-bottom: 10px;
              font-size: 18px;
            }
            .date {
              text-align: right;
              margin-bottom: 10px;
              font-style: italic;
              font-size: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 3px 5px;
              text-align: left;
              font-size: 10px;
              line-height: 1.2;
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
              font-size: 10px;
              margin-top: 15px;
              color: #666;
            }
            .day-header {
              background-color: #1976d2;
              color: white;
              text-align: center;
              font-size: 10px;
            }
            .feriado {
              background-color: #ffebee;
              color: #c62828;
            }
            .feriado-description {
              font-size: 9px;
              font-style: italic;
              color: #c62828;
            }
            .vino td:first-child {
              position: relative;
            }
            .vino td:first-child::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 0;
              width: calc(100vw - 40px);
              height: 1px;
              background: #999;
              pointer-events: none;
            }
            .vino td {
              color: #666;
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
                <th>Teléfono</th>
                <th>Patente</th>
                <th>Auto</th>
                <th>Problema</th>
                <th>Presup. ID</th>
                ${weekDays
                  .map((day) => {
                    const feriado = feriados.find(
                      (f) =>
                        format(new Date(f.fecha), "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd"),
                    );
                    return `
                      <th class="day-header ${feriado ? "feriado" : ""}">
                        ${format(day, "EEEE d", { locale: es })}
                        ${
                          feriado
                            ? `<br><span class="feriado-description">${feriado.descripcion}</span>`
                            : ""
                        }
                      </th>
                    `;
                  })
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${turnos
                .map((turno) => {
                  const turnoDate = new Date(turno.fecha);
                  const dayIndex = weekDays.findIndex(
                    (d) =>
                      format(d, "yyyy-MM-dd") ===
                      format(turnoDate, "yyyy-MM-dd"),
                  );

                  return `
                    <tr class="${turno.vino !== null && turno.vino !== undefined ? "vino" : ""}">
                      <td>${
                        turno.auto?.owner?.fullName ||
                        turno.clienteNombre ||
                        "N/A"
                      }</td>
                      <td>${
                        turno.auto?.owner?.phone || turno.clienteTelefono || ""
                      }</td>
                      <td>${
                        turno.auto
                          ? (turno.auto.patent ?? "—")
                          : ((turno as { informacionPatente?: string | null })
                              .informacionPatente ?? "—")
                      }</td>
                      <td>${
                        turno.auto
                          ? `${turno.auto.brand} ${turno.auto.model} - ${turno.auto.patent}`
                          : turno.informacionAuto || "N/A"
                      }</td>
                      <td>${turno.problema || ""}</td>
                      <td>${(turno as { presupuestoId?: string | null }).presupuestoId ?? ""}</td>
                      ${weekDays
                        .map((day, index) => {
                          const feriado = feriados.find(
                            (f) =>
                              format(new Date(f.fecha), "yyyy-MM-dd") ===
                              format(day, "yyyy-MM-dd"),
                          );
                          return index === dayIndex
                            ? `<td class="${feriado ? "feriado" : ""}">${
                                turno.hora || ""
                              }</td>`
                            : `<td class="${feriado ? "feriado" : ""}"></td>`;
                        })
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

    // Generate PDF (Legal = hoja oficio 21.59 x 35.56 cm)
    const pdfBuffer = await page.pdf({
      format: "Legal",
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

    // Return the PDF as a response - convert Buffer to Uint8Array for compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="turnos-semana.pdf"`,
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
