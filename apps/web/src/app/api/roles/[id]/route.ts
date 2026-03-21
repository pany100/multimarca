import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
}

async function fetchRolCompleto(id: number) {
  return prisma.rol.findUnique({
    where: { id },
    include: {
      permisos: { select: { id: true, name: true } },
      usuarios: {
        select: { id: true, fullName: true, email: true, username: true },
        orderBy: { fullName: "asc" },
      },
    },
  });
}

function toJson(rol: NonNullable<Awaited<ReturnType<typeof fetchRolCompleto>>>) {
  return {
    id: rol.id,
    name: rol.name,
    permisos: rol.permisos.map((p) => p.name),
    usuarios: rol.usuarios.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      username: u.username,
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const rol = await fetchRolCompleto(id);
    if (!rol) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    return NextResponse.json(toJson(rol));
  } catch (error) {
    console.error("Error al obtener rol:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el rol" },
      { status: 500 },
    );
  }
}

/** Actualización parcial: solo `name`, solo `permisos`, o ambos. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, permisos } = body as {
      name?: string;
      permisos?: string[];
    };

    if (name === undefined && permisos === undefined) {
      return NextResponse.json(
        { error: "Indique name y/o permisos" },
        { status: 400 },
      );
    }

    const rolActual = await prisma.rol.findUnique({ where: { id } });
    if (!rolActual) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    const data: {
      name?: string;
      permisos?: { set: { id: number }[] };
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Nombre de rol inválido" },
          { status: 400 },
        );
      }
      data.name = name.trim();
    }

    if (permisos !== undefined) {
      if (!Array.isArray(permisos)) {
        return NextResponse.json(
          { error: "permisos debe ser un array" },
          { status: 400 },
        );
      }
      let records: { id: number }[] = [];
      if (permisos.length > 0) {
        const found = await prisma.permiso.findMany({
          where: { name: { in: permisos } },
        });
        if (found.length !== permisos.length) {
          return NextResponse.json(
            { error: "Uno o más permisos no existen" },
            { status: 400 },
          );
        }
        records = found.map((p) => ({ id: p.id }));
      }
      data.permisos = { set: records };
    }

    await prisma.rol.update({
      where: { id },
      data,
    });

    const rol = await fetchRolCompleto(id);
    if (!rol) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    return NextResponse.json(toJson(rol));
  } catch (error) {
    console.error("Error al actualizar rol (PATCH):", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el rol" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, permisos } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de rol inválido o faltante" },
        { status: 400 },
      );
    }

    if (!Array.isArray(permisos)) {
      return NextResponse.json(
        { error: "permisos debe ser un array" },
        { status: 400 },
      );
    }

    let existingPermissions: { id: number; name: string }[] = [];
    if (permisos.length > 0) {
      existingPermissions = await prisma.permiso.findMany({
        where: { name: { in: permisos } },
      });
      if (existingPermissions.length !== permisos.length) {
        return NextResponse.json(
          { error: "Uno o más permisos no existen" },
          { status: 400 },
        );
      }
    }

    const rolActual = await prisma.rol.findUnique({
      where: { id },
      include: { permisos: true },
    });

    if (!rolActual) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    const permisosADesconectar = rolActual.permisos.filter(
      (permiso) => !permisos.includes(permiso.name),
    );

    const rolActualizado = await prisma.rol.update({
      where: { id },
      data: {
        name: name.trim(),
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
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
      { status: 500 },
    );
  }
}
