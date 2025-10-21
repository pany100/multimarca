import generarReciboVentas from "@/utils/generarReciboVentas";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ingresoPorVenta = await prisma.ingresoPorVenta.findUnique({
      where: { id },
      include: {
        cliente: true,
        venta: {
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
                reciboFile: true,
              },
            },
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

    if (!ingresoPorVenta) {
      return new Response(
        JSON.stringify({ error: "Ingreso por venta no encontrado" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const pdfBuffer = await generarPdfRecibo(ingresoPorVenta);

    // Convert Buffer to Uint8Array which is compatible with Response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo_venta_${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el recibo:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el recibo" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function generarPdfRecibo(ingresoPorVenta: any): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generarReciboVentas(ingresoPorVenta);
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
