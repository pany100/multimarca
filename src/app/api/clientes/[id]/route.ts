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
      phone,
      fullName,
      email,
      birthday,
      address,
      city,
      state,
      postal_code,
      tax_status,
      dni,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "El nombre completo es obligatorio" },
        { status: 400 }
      );
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: {
        phone,
        fullName,
        email,
        birthday: birthday ? new Date(birthday) : null,
        address,
        city,
        state,
        postal_code,
        tax_status,
        dni,
      },
      include: {
        cars: true,
      },
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cliente" },
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

    const clienteEliminado = await prisma.cliente.delete({
      where: { id },
    });

    if (!clienteEliminado) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cliente" },
      { status: 500 }
    );
  }
}
