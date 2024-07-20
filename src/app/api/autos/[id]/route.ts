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
      patent,
      model,
      brand,
      color,
      year,
      kms,
      valves,
      ownerId,
      chassis_number,
      engine_number,
      observations,
      transmission_type,
    } = body;

    if (!patent) {
      return NextResponse.json(
        { error: "La patente es obligatoria" },
        { status: 400 }
      );
    }

    const autoActualizado = await prisma.auto.update({
      where: { id },
      data: {
        patent,
        model,
        brand,
        color,
        year: year ? parseInt(year, 10) : null,
        kms: kms ? parseInt(kms, 10) : null,
        valves: valves ? parseInt(valves, 10) : null,
        ownerId,
        chassis_number,
        engine_number,
        observations,
        transmission_type,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(autoActualizado);
  } catch (error) {
    console.error("Error al actualizar auto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el auto" },
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

    const autoEliminado = await prisma.auto.delete({
      where: { id },
    });

    if (!autoEliminado) {
      return NextResponse.json(
        { error: "Auto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Auto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar auto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el auto" },
      { status: 500 }
    );
  }
}
