import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.rol.findMany({
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
    });

    const rolesConPermisos = roles.map((rol) => ({
      ...rol,
      permisos: rol.permisos.map((permiso) => permiso.name),
    }));

    return NextResponse.json(rolesConPermisos);
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
