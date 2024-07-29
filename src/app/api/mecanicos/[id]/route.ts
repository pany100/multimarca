import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

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
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de mecánico inválido o faltante" },
        { status: 400 }
      );
    }

    const mecanicoActualizado = await prisma.mecanico.update({
      where: { id },
      data: {
        name,
        start_date: start_date ? new Date(start_date) : null,
        dni: dni ? dni.toString() : null,
        address,
        city,
        state,
        postal_code,
        email,
        phone,
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

    const mecanicoEliminado = await prisma.mecanico.delete({
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
