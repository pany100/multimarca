import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  try {
    const permisos = await prisma.permiso.findMany();
    return NextResponse.json(permisos);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los permisos" },
      { status: 500 }
    );
  }
}
