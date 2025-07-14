import { signupUser } from "@/lib/auth/userService";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          AND: [
            {
              OR: [
                { fullName: { contains: query } },
                { email: { contains: query } },
                { username: { contains: query } },
              ],
            },
            { id: { not: 1 } },
          ],
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          username: true,
          activo: true,
          rolId: true,
          rol: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: size,
        orderBy: { fullName: "asc" },
      }),
      prisma.usuario.count({
        where: {
          AND: [
            {
              OR: [
                { fullName: { contains: query } },
                { email: { contains: query } },
                { username: { contains: query } },
              ],
            },
            { id: { not: 1 } },
          ],
        },
      }),
    ]);

    const usuariosConRolName = usuarios.map((usuario) => ({
      ...usuario,
      rol: usuario.rol?.name,
    }));

    return NextResponse.json({
      items: usuariosConRolName,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, username, rolId, email, password } = body;

    if (!fullName || !username || !rolId || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (
      typeof fullName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof rolId !== "number"
    ) {
      return NextResponse.json(
        { error: "Tipo de datos incorrecto" },
        { status: 400 }
      );
    }
    const nuevoUsuario = await signupUser(body);
    const nuevoUsuarioConRolName = {
      ...nuevoUsuario,
      rol: nuevoUsuario.rol?.name,
    };
    return NextResponse.json(nuevoUsuarioConRolName, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 400 }
    );
  }
}
