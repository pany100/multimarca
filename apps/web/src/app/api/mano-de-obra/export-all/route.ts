import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all mano de obra items without pagination
    const trabajos = await prisma.manoDeObra.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(trabajos);
  } catch (error) {
    console.error(
      "Error al obtener todos los trabajos de mano de obra:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
