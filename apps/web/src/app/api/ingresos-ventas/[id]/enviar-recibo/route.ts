import { sendWhatsAppMessage, uploadMedia } from "@/services/whatsappService";
import generarReciboVentas from "@/utils/generarReciboVentas";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function POST(
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

    if (!ingresoPorVenta) {
      return NextResponse.json(
        { error: "Ingreso por venta no encontrado" },
        { status: 404 }
      );
    }

    // Genera el PDF
    const pdfBuffer = await generarPdfRecibo(ingresoPorVenta);

    // Envía el PDF por WhatsApp
    const response = await enviarReciboViaWhatsApp(ingresoPorVenta, pdfBuffer);

    // Actualiza el campo reciboEnviado a true
    await prisma.ingresoPorVenta.update({
      where: { id },
      data: { reciboEnviado: true },
    });

    return NextResponse.json(
      { message: "Recibo enviado con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al enviar el recibo:", error);
    return NextResponse.json(
      { error: "Error al enviar el recibo" },
      { status: 500 }
    );
  }
}

async function enviarReciboViaWhatsApp(
  ingresoPorVenta: any,
  pdfBuffer: Buffer
) {
  const mediaId = await uploadMedia(pdfBuffer);
  const message = await sendWhatsAppMessage(
    ingresoPorVenta.cliente.phoneNumber,
    "recibo_pago",
    [
      // For ventas, we don't have an auto.patent, so we use "Venta" + ID instead
      `Venta #${ingresoPorVenta.venta.id}`,
      ingresoPorVenta.monto.toFixed(2),
    ],
    mediaId
  );
  return message;
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
