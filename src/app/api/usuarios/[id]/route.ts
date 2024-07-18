import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        rol: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}
