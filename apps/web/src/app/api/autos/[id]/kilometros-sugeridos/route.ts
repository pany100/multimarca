import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const autoId = parseInt(params.id);

    if (isNaN(autoId)) {
      return NextResponse.json(
        { error: "ID de auto inválido" },
        { status: 400 }
      );
    }

    const auto = await prisma.auto.findUnique({
      where: {
        id: autoId,
      },
      select: {
        kms: true,
      },
    });

    if (!auto) {
      return NextResponse.json(
        { error: "Auto no encontrado" },
        { status: 404 }
      );
    }

    const ultimaReparacion = await prisma.ordenReparacion.findFirst({
      where: {
        autoId: autoId,
      },
      select: {
        kilometros: true,
      },
      orderBy: {
        fechaCreacion: "desc",
      },
    });

    const kilometros = ultimaReparacion?.kilometros || auto.kms;

    return NextResponse.json({ kilometros });
  } catch (error) {
    console.error("Error al obtener kilómetros del auto:", error);
    return NextResponse.json(
      { error: "Error al obtener kilómetros del auto" },
      { status: 500 }
    );
  }
}
