import { PrismaConfiguracionGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-configuracion-general.repository";
import {
  sendWhatsAppMessage,
  uploadMedia,
} from "@/services/notificaciones-whataspp-old";
import generateReciboHtml from "@/utils/generateReciboHtml";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function POST(
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

    if (!ingresoPorReparacion) {
      return NextResponse.json(
        { error: "Ingreso por reparación no encontrado" },
        { status: 404 }
      );
    }

    // Encabezado desde ConfiguracionGeneral
    const configRepo = new PrismaConfiguracionGeneralRepository();
    const headerConfig = await configRepo.findByNombre("Encabezado PDF");
    const encabezadoPdf = headerConfig?.valor;

    // Genera el PDF
    const pdfBuffer = await generarPdfRecibo(ingresoPorReparacion, encabezadoPdf);

    // Envía el PDF por WhatsApp
    const response = await enviarReciboViaWhatsApp(
      ingresoPorReparacion,
      pdfBuffer
    );

    // Actualiza el campo reciboEnviado a true
    await prisma.ingresoPorReparacion.update({
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
  ingresoPorReparacion: any,
  pdfBuffer: Buffer
) {
  const mediaId = await uploadMedia(pdfBuffer);
  const message = await sendWhatsAppMessage(
    ingresoPorReparacion.cliente.phoneNumber,
    "recibo_pago",
    [
      ingresoPorReparacion.ordenReparacion.auto.patent,
      ingresoPorReparacion.monto.toFixed(2),
    ],
    mediaId
  );
  return message;
}

async function generarPdfRecibo(ingresoPorReparacion: any, encabezadoPdf?: string): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateReciboHtml(ingresoPorReparacion, encabezadoPdf);
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
