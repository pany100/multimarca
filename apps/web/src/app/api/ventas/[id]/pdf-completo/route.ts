import { PrismaConfiguracionGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-configuracion-general.repository";
import generateVentasHtml from "@/utils/generateVentasHtml";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const venta = await prisma.venta.findUnique({
      where: { id },
      include: {
        cliente: true,
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
        ingresos: true,
      },
    });

    if (!venta) {
      return new Response(JSON.stringify({ error: "Venta no encontrada" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Footer desde ConfiguracionGeneral (id 3 = venta)
    const configRepo = new PrismaConfiguracionGeneralRepository();
    const footerConfig = await configRepo.findById(3);
    const footerTexto = footerConfig?.valor ?? "";

    // 1. Generar el PDF base usando puppeteer
    const basePdfBuffer = await generateBasePdf(venta, footerTexto);

    // 5. Devolver el PDF base como descarga - convert Buffer to Uint8Array for compatibility
    return new Response(new Uint8Array(basePdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="venta-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF completo:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el PDF completo" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function generateBasePdf(
  venta: any,
  footerTexto: string
): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateVentasHtml(venta);
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
        <div style="text-align: left; font-size: 12px; margin-top: 8px;">${footerTexto}</div>
      </div>
    `,
  });

  await browser.close();
  return pdfBuffer;
}
