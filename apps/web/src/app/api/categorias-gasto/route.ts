import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "100");
    const query = searchParams.get("query") || "";

    // Obtener el token de la cabecera de autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    // Obtener el rol del usuario desde la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decodedToken.userId },
      include: {
        rol: true,
      },
    });

    if (!user || !user.rol) {
      return NextResponse.json(
        { error: "Usuario no tiene rol asignado" },
        { status: 403 }
      );
    }

    const skip = page * size;

    const whereClause = {
      nombre: { contains: query },
      OR: [
        { roles: { none: {} } },
        { roles: { some: { name: user.rol.name } } },
      ],
    };

    const [categoriasGasto, total] = await Promise.all([
      prisma.categoriaGasto.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { nombre: "asc" },
        include: {
          roles: true,
        },
      }),
      prisma.categoriaGasto.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: categoriasGasto,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener categorías de gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Nombre de categoría inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevaCategoriaGasto = await prisma.categoriaGasto.create({
      data: {
        nombre,
      },
    });

    return NextResponse.json(nuevaCategoriaGasto, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría de gasto:", error);
    return NextResponse.json(
      { error: "No se pudo crear la categoría de gasto" },
      { status: 500 }
    );
  }
}
