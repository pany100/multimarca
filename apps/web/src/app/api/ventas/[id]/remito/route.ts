import generateVentasRemitoHtml from "@/utils/generateVentasRemitoHtml";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const url = new URL(request.url);
    const tipo = url.searchParams.get("tipo") === "duplicado" ? "duplicado" : "original";
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

    const basePdfBuffer = await generateBasePdf(venta, tipo);

    return new Response(new Uint8Array(basePdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="remito-venta-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el remito:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el remito" }),
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
  tipo: "original" | "duplicado",
): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateVentasRemitoHtml(venta, tipo);
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
    displayHeaderFooter: false,
  });

  await browser.close();
  return pdfBuffer;
}

