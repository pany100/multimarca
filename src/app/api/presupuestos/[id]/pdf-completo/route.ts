import generateBudgetHtml from "@/utils/generateBudgetHtml";
import { NextResponse } from "next/server";
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
        dolar: true,
      },
    });

    if (!presupuesto) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    // Generar el PDF base usando puppeteer
    const pdfBuffer = await generateBasePdf(presupuesto);

    // Devolver el PDF como descarga
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="presupuesto-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF del presupuesto:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF del presupuesto" },
      { status: 500 }
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
  });

  await browser.close();

  return pdfBuffer;
}
