import { verifyToken } from "@/lib/auth/authService";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
        rol: {
          select: {
            name: true,
            permisos: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Transformar los permisos a un array de strings
    const permisos =
      usuario?.rol?.permisos.map((permiso) => permiso.name) || [];

    // Crear un nuevo objeto con los datos del usuario y los permisos
    const usuarioConPermisos = {
      ...usuario,
      permisos,
    };

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuarioConPermisos);
  } catch (error) {
    console.error("Error en /usuarios/yo:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
