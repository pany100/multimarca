import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import generateReciboHtml from "@/utils/generateReciboHtml";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ingresoPorReparacion = await prisma.ingresoPorReparacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
            repuestosUsados: true,
            reparacionesDeTercero: true,
            trabajosRealizados: true,
            ingresos: {
              include: {
                dolar: true,
              },
            },
          },
        },
      },
    });

    if (!ingresoPorReparacion) {
      return new Response(
        JSON.stringify({ error: "Ingreso por reparación no encontrado" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const pdfBuffer = await generarPdfRecibo(ingresoPorReparacion);

    // Convert Buffer to Uint8Array which is compatible with Response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo_${id}.pdf"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

async function generarPdfRecibo(ingresoPorReparacion: any): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateReciboHtml(ingresoPorReparacion);
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
  });

  await browser.close();

  return pdfBuffer;
}
