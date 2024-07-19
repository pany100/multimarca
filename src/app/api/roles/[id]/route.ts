import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
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

    // Obtener los permisos actuales del rol
    const rolActual = await prisma.rol.findUnique({
      where: { id },
      include: { permisos: true },
    });

    if (!rolActual) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // Identificar los permisos a desconectar
    const permisosADesconectar = rolActual.permisos.filter(
      (permiso) => !permisos.includes(permiso.name)
    );

    const rolActualizado = await prisma.rol.update({
      where: { id },
      data: {
        name,
        permisos: {
          disconnect: permisosADesconectar.map((permiso) => ({
            id: permiso.id,
          })),
          set: existingPermissions.map((permiso) => ({ id: permiso.id })),
        },
      },
      include: {
        permisos: true,
      },
    });

    const rolConPermisosNombres = {
      ...rolActualizado,
      permisos: rolActualizado.permisos.map((permiso) => permiso.name),
    };

    return NextResponse.json(rolConPermisosNombres);
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el rol" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.rol.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Rol eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el rol" },
      { status: 500 }
    );
  }
}
