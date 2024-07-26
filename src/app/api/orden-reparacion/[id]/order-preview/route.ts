import generateClientOrderHtml from "@/utils/generateClientOrderHtml";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
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
    const html = generateClientOrderHtml(ordenReparacion);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al generar la vista previa" },
      { status: 500 }
    );
  }
}
