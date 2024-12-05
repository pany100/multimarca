import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de borrador inválido" },
        { status: 400 }
      );
    }

    const borrador = await prisma.borrador.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        trabajosRealizados: true,
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
      },
    });

    if (!borrador) {
      return NextResponse.json(
        { error: "Borrador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(borrador);
  } catch (error) {
    console.error("Error al obtener borrador:", error);
    return NextResponse.json(
      { error: `Error al obtener el borrador: ${error}` },
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

    const borradorActualizado = await prisma.borrador.update({
      where: { id },
      data: body,
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
      },
    });

    return NextResponse.json(borradorActualizado);
  } catch (error) {
    console.error("Error al actualizar borrador:", error);
    return NextResponse.json(
      { error: `Error al actualizar el borrador: ${error}` },
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

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de borrador inválido" },
        { status: 400 }
      );
    }

    const borradorEliminado = await prisma.borrador.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Borrador eliminado correctamente",
      borrador: borradorEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar borrador:", error);
    return NextResponse.json(
      { error: "Error al eliminar el borrador" },
      { status: 500 }
    );
  }
}
