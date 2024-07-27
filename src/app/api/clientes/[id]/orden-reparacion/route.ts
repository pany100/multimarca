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

    return NextResponse.json(ordenesReparacion);
  } catch (error) {
    console.error("Error al obtener las órdenes de reparación:", error);
    return NextResponse.json(
      { error: "Error al obtener las órdenes de reparación" },
      { status: 500 }
    );
  }
}
