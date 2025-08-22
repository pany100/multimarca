import generateBudgetHtml from "@/utils/generateBudgetHtml";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        administrativo: true,
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        trabajosRealizados: true,
        tareasAdministrativas: {
          include: {
            usuario: true,
          },
        },
        dolar: true,
      },
    });

    if (!presupuesto) {
      return new Response(
        JSON.stringify({ error: "Presupuesto no encontrado" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generar el PDF base usando puppeteer
    const pdfBuffer = await generateBasePdf(presupuesto);

    // Devolver el PDF como descarga - convert Buffer to Uint8Array for compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="presupuesto-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF del presupuesto:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el PDF del presupuesto" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function generateBasePdf(presupuesto: any): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateBudgetHtml(presupuesto);
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="margin: 0 25px; padding: 0 20px; width: 100%; font-family: Arial, sans-serif;">
        <div style="border-top: 1px solid black; width: 100%;"></div>
        <div style="text-align: left; font-size: 12px; margin-top: 8px;">
           Detalle de presupuesto solicitado, valores al día, sujeto a desarme
        </div>
      </div>
    `,
  });

  await browser.close();

  return pdfBuffer;
}
