import { sendWhatsAppMessage, uploadMedia } from "@/services/whatsappService";
import generateClientOrderHtml from "@/utils/generateClientOrderHtml";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ordenReparacion = await prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: true,
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
        controlesEnReparacion: {
          include: {
            controlMecanico: true,
          },
        },
      },
    });

    // Genera el PDF
    const pdfBuffer = await generatePdf(ordenReparacion);

    // Envía el PDF por WhatsApp
    const response = await sendPdfViaWhatsApp(ordenReparacion, pdfBuffer);

    return NextResponse.json(
      { message: "Notificación enviada con éxito" },
      { status: 200 }
    );
  } catch (error) {
    // En caso de error, podrías manejarlo aquí
    console.error("Error al enviar la notificación:", error);
    return NextResponse.json(
      { error: "Error al enviar la notificación" },
      { status: 500 }
    );
  }
}

async function sendPdfViaWhatsApp(ordenReparacion: any, pdfBuffer: Buffer) {
  const mediaId = await uploadMedia(pdfBuffer);
  const message = await sendWhatsAppMessage(
    "1156007307",
    "reparacion_terminada_pdf",
    [ordenReparacion.auto.patent],
    mediaId
  );
  return message;
}

async function generatePdf(repair: any): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateClientOrderHtml(repair);
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

export { generatePdf };
