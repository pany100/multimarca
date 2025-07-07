import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const incluirAnteriores = searchParams.get("incluirAnteriores") === "true";

    // Obtener el usuario actual
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (!fecha) {
      return NextResponse.json(
        { error: "La fecha es obligatoria" },
        { status: 400 }
      );
    }

    // Construir la condición de búsqueda
    let where: any = {
      usuarioId: user.id,
    };
    const fechaDate = new Date(fecha);

    // Incluir tareas pendientes de fechas anteriores si se solicita
    if (incluirAnteriores) {
      where = {
        ...where,
        OR: [
          {
            fecha: {
              gte: fechaDate,
            },
          },
          {
            fecha: { lt: fechaDate },
            realizado: false,
          },
        ],
      };
    } else {
      where.fecha = {
        gte: fechaDate,
      };
    }

    // Buscar tareas
    const tareas = await prisma.tareaDiaria.findMany({
      where,
      orderBy: [{ id: "desc" }, { fecha: "asc" }],
      include: {
        usuario: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    return NextResponse.json(tareas);
  } catch (error) {
    console.error("Error al obtener tareas diarias:", error);
    return NextResponse.json(
      { error: "Error al obtener tareas diarias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descripcion } = body;

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!descripcion) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    // Crear la tarea diaria
    const tarea = await prisma.tareaDiaria.create({
      data: {
        descripcion,
        fecha: new Date(),
        realizado: false,
        usuarioId: user.id,
      },
    });
    const io = getIO();
    if (io) {
      io.emit("newTarea");
    }

    return NextResponse.json(tarea, { status: 201 });
  } catch (error) {
    console.error("Error al crear tarea diaria:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
