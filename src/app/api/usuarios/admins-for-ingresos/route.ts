import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const adminUsers = await prisma.usuario.findMany({
      where: {
        OR: [
          {
            AND: [{ rol: { name: "Administrador" } }, { id: { not: 1 } }],
          },
          { fullName: "Gabriela Ateca" },
        ],
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        rol: true,
      },
    });

    return NextResponse.json(adminUsers);
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    return NextResponse.json(
      { error: "No se pudo obtener la lista de administradores" },
      { status: 500 }
    );
  }
}
