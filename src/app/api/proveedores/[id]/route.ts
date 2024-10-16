import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, address, email, phone, mobile, iva, cuit, numeroProveedor } =
      body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de proveedor inválido o faltante" },
        { status: 400 }
      );
    }

    const cantProveedores = await prisma.proveedor.count({
      where: {
        numeroProveedor: parseInt(numeroProveedor),
        NOT: { id: id },
      },
    });

    if (cantProveedores > 0) {
      return NextResponse.json(
        { error: "Nombre de proveedor repetido" },
        { status: 400 }
      );
    }

    const proveedorActualizado = await prisma.proveedor.update({
      where: { id },
      data: {
        name,
        address,
        email,
        phone,
        mobile,
        iva,
        cuit,
        numeroProveedor,
      },
    });

    return NextResponse.json(proveedorActualizado);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return NextResponse.json(
      { error: "Error al actualizar el proveedor" },
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

    const proveedorEliminado = await prisma.proveedor.delete({
      where: { id },
    });

    if (!proveedorEliminado) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Proveedor eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return NextResponse.json(
      { error: "Error al eliminar el proveedor" },
      { status: 500 }
    );
  }
}
