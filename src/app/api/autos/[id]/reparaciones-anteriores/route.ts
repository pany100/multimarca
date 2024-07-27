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

    const reparacionesAnteriores = await prisma.ordenReparacion.findMany({
      where: {
        autoId: autoId,
        estado: "Terminado",
      },
      select: {
        id: true,
        fechaCreacion: true,
        fechaSalidaReparacion: true,
        observacionesSalida: true,
        manoDeObra: true,
      },
      orderBy: {
        fechaCreacion: "desc",
      },
    });

    return NextResponse.json(reparacionesAnteriores);
  } catch (error) {
    console.error("Error al obtener reparaciones anteriores:", error);
    return NextResponse.json(
      { error: "Error al obtener reparaciones anteriores" },
      { status: 500 }
    );
  }
}
