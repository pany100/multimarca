import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [permisosGasto, total] = await Promise.all([
      prisma.categoriaGasto.findMany({
        where: {
          nombre: { contains: query },
          roles: {
            some: {},
          },
        },
        skip,
        take: size,
        orderBy: { nombre: "asc" },
        include: {
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.categoriaGasto.count({
        where: {
          nombre: { contains: query },
          roles: {
            some: {},
          },
        },
      }),
    ]);

    const permisosGastoConRoles = permisosGasto.map((permiso) => ({
      ...permiso,
      roles: permiso.roles.map((rol) => rol.id),
      rolesData: permiso.roles,
    }));

    return NextResponse.json({
      items: permisosGastoConRoles,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener permisos de gasto:", error);
    return NextResponse.json(
      { error: "Error al obtener los permisos de gasto" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id, roles } = await request.json();
    const existingGasto = await prisma.categoriaGasto.findUnique({
      where: { id: parseInt(id) },
      include: {
        roles: true,
      },
    });

    if (!existingGasto) {
      return NextResponse.json(
        { error: "No se encontró la categoría de gasto" },
        { status: 404 }
      );
    }

    if (existingGasto.roles.length > 0) {
      return NextResponse.json(
        { error: "La categoría de gasto ya tiene roles asignados" },
        { status: 400 }
      );
    }

    // Buscar los roles por nombre
    const rolesEncontrados = await prisma.rol.findMany({
      where: {
        id: {
          in: roles,
        },
      },
    });

    if (rolesEncontrados.length !== roles.length) {
      return NextResponse.json(
        { error: "Algunos roles especificados no existen" },
        { status: 400 }
      );
    }

    const categoriaGasto = await prisma.categoriaGasto.update({
      where: { id: parseInt(id) },
      data: {
        roles: {
          connect: rolesEncontrados.map((rol) => ({ id: rol.id })),
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const categoriaGastoConRoles = {
      ...categoriaGasto,
      roles: categoriaGasto.roles.map((rol) => rol.name),
    };

    return NextResponse.json(categoriaGastoConRoles);
  } catch (error) {
    console.error("Error al crear permiso de gasto:", error);
    return NextResponse.json(
      { error: "Error al crear el permiso de gasto" },
      { status: 500 }
    );
  }
}
