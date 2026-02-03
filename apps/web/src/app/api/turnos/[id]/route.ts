import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { hora, fecha, problema, autoId, informacionAuto, informacionCliente } = body;

    if (!hora || !fecha || !problema) {
      return NextResponse.json(
        { error: "Hora, fecha y problema son requeridos" },
        { status: 400 }
      );
    }

    // Validar que al menos uno de autoId o informacionAuto esté presente
    if (!autoId && !informacionAuto) {
      return NextResponse.json(
        { error: "Debe seleccionar un vehículo o ingresar información del vehículo nuevo" },
        { status: 400 }
      );
    }

    // First, get the current turno
    const currentTurno = await prisma.turno.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentTurno) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    // Check if the current turno is in the past
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison
    const turnoDate = new Date(currentTurno.fecha);
    turnoDate.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison

    if (turnoDate < currentDate) {
      return NextResponse.json(
        { error: "No se pueden modificar turnos pasados" },
        { status: 400 }
      );
    }

    // Check if the new date is a Feriado
    const requestDate = new Date(fecha);
    requestDate.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison

    const feriado = await prisma.feriado.findFirst({
      where: {
        fecha: requestDate,
      },
    });

    if (feriado) {
      return NextResponse.json(
        { error: "No se pueden programar turnos en días feriados" },
        { status: 400 }
      );
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id: parseInt(id) },
      data: {
        hora,
        fecha: new Date(fecha),
        problema,
        autoId: autoId || null,
        informacionAuto: informacionAuto || null,
        informacionCliente: informacionCliente || null,
      } as any,
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    return NextResponse.json(turnoActualizado);
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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

    // Check if the turno exists
    const turno = await prisma.turno.findUnique({
      where: { id },
    });

    if (!turno) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    await prisma.turno.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Turno eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
