import puppeteer from "puppeteer";
import { prisma } from "@/core/infrastructure/database/prisma";
import generateClientOrderHtml from "@/utils/generateClientOrderHtml";
import generateBudgetHtml from "@/utils/generateBudgetHtml";
import generateVentasHtml from "@/utils/generateVentasHtml";

export async function generatePdfBuffer(
  resourceType: "orden" | "venta" | "presupuesto",
  resourceId: number
): Promise<Buffer> {
  let html = "";

  if (resourceType === "orden") {
    const data = await prisma.ordenReparacion.findUnique({
      where: { id: resourceId },
      include: {
        auto: { include: { owner: true } },
        mecanicos: { include: { mecanico: true } },
        repuestosUsados: { include: { stock: true } },
        reparacionesDeTercero: { include: { proveedor: true } },
        revisadoPor: true,
        trabajosRealizados: true,
        ajustesPrecio: { orderBy: { orden: "asc" } },
        controlesEnReparacion: {
          include: { controlMecanico: { include: { parent: true } } },
        },
        ingresos: { include: { dolar: true } },
      },
    });
    if (!data) throw new Error("Orden no encontrada");
    html = generateClientOrderHtml(data);
  }

  if (resourceType === "venta") {
    const data = await prisma.venta.findUnique({
      where: { id: resourceId },
      include: {
        cliente: true,
        repuestosUsados: { include: { stock: true } },
        reparacionesDeTercero: { include: { proveedor: true } },
        trabajosRealizados: true,
        ajustesPrecio: { orderBy: { orden: "asc" } },
        ingresos: true,
      },
    });
    if (!data) throw new Error("Venta no encontrada");
    html = generateVentasHtml(data);
  }

  if (resourceType === "presupuesto") {
    const data = await prisma.presupuesto.findUnique({
      where: { id: resourceId },
      include: {
        auto: { include: { owner: true } },
        repuestosUsados: { include: { stock: true } },
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        ajustesPrecio: { orderBy: { orden: "asc" } },
        tareasAdministrativas: { include: { usuario: true } },
        dolar: true,
      },
    });
    if (!data) throw new Error("Presupuesto no encontrado");
    html = generateBudgetHtml(data);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });
  await browser.close();
  return pdfBuffer;
}

