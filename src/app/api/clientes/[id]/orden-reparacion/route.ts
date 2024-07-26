import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);
    const ordenesReparacion = await prisma.ordenReparacion.findMany({
      where: {
        auto: {
          ownerId: clienteId,
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!ordenesReparacion || ordenesReparacion.length === 0) {
      return NextResponse.json(
        {
          mensaje: "No se encontraron órdenes de reparación para este cliente",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(ordenesReparacion);
  } catch (error) {
    console.error("Error al obtener las órdenes de reparación:", error);
    return NextResponse.json(
      { error: "Error al obtener las órdenes de reparación" },
      { status: 500 }
    );
  }
}
