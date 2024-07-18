import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/authService";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token no proporcionado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = (await verifyToken(token)) as { userId: number };
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        rol: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error en /usuarios/yo:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
