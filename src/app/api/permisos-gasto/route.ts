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
      roles: permiso.roles.map((rol) => rol.name),
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
    });

    if (!existingGasto) {
      return NextResponse.json(
        { error: "No se encontró la categoría de gasto" },
        { status: 404 }
      );
    }
    const categoriaGasto = await prisma.categoriaGasto.update({
      where: { id: parseInt(id) },
      data: {
        roles: {
          connect: roles.map((rolId: number) => ({ id: rolId })),
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

    return NextResponse.json(categoriaGasto);
  } catch (error) {
    console.error("Error al crear permiso de gasto:", error);
    return NextResponse.json(
      { error: "Error al crear el permiso de gasto" },
      { status: 500 }
    );
  }
}
