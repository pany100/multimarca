import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const empleado = await prisma.empleado.findUnique({
      where: { id },
    });

    if (!empleado) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    // Convertir BigInt a string para serialización
    const empleadoSerializable = {
      ...empleado,
      dni: empleado.dni ? empleado.dni.toString() : null,
    };

    return NextResponse.json(empleadoSerializable);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      start_date,
      dni,
      address,
      city,
      state,
      postal_code,
      email,
      phone,
      birthday,
      tipo,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de mecánico inválido o faltante" },
        { status: 400 }
      );
    }

    const mecanicoActualizado = await prisma.empleado.update({
      where: { id },
      data: {
        name: name.toUpperCase(),
        start_date: start_date ? new Date(start_date) : null,
        dni: dni ? dni.toString() : null,
        address,
        city,
        state,
        postal_code,
        email,
        phone,
        tipo,
        birthday: birthday ? new Date(birthday) : null,
      },
    });

    return NextResponse.json(mecanicoActualizado);
  } catch (error) {
    console.error("Error al actualizar mecánico:", error);
    return NextResponse.json(
      { error: "Error al actualizar el mecánico" },
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

    const mecanicoEliminado = await prisma.empleado.delete({
      where: { id },
    });

    if (!mecanicoEliminado) {
      return NextResponse.json(
        { error: "Mecánico no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Mecánico eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar mecánico:", error);
    return NextResponse.json(
      { error: "Error al eliminar el mecánico" },
      { status: 500 }
    );
  }
}
