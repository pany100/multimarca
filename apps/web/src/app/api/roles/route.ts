import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [roles, total] = await Promise.all([
      prisma.rol.findMany({
        where: {
          name: { contains: query },
        },
        select: {
          id: true,
          name: true,
          permisos: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.rol.count({
        where: {
          name: { contains: query },
        },
      }),
    ]);

    const rolesConPermisos = roles.map((rol) => ({
      ...rol,
      permisos: rol.permisos.map((permiso) => permiso.name),
    }));

    return NextResponse.json({
      items: rolesConPermisos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, permisos } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de rol inválido o faltante" },
        { status: 400 }
      );
    }

    if (!Array.isArray(permisos) || permisos.length === 0) {
      return NextResponse.json(
        { error: "Permisos inválidos o faltantes" },
        { status: 400 }
      );
    }

    // Verificar que todos los permisos existan
    const existingPermissions = await prisma.permiso.findMany({
      where: {
        name: {
          in: permisos,
        },
      },
    });

    if (existingPermissions.length !== permisos.length) {
      return NextResponse.json(
        { error: "Uno o más permisos no existen" },
        { status: 400 }
      );
    }

    const nuevoRol = await prisma.rol.create({
      data: {
        name,
        permisos: {
          connect: existingPermissions.map((permiso) => ({ id: permiso.id })),
        },
      },
      include: {
        permisos: true,
      },
    });

    const rolConPermisosNombres = {
      ...nuevoRol,
      permisos: nuevoRol.permisos.map((permiso) => permiso.name),
    };

    return NextResponse.json(rolConPermisosNombres, { status: 201 });
  } catch (error) {
    console.error("Error al crear rol:", error);
    return NextResponse.json(
      { error: "No se pudo crear el rol" },
      { status: 500 }
    );
  }
}
