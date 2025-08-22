import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proveedorId = parseInt(params.id);

    // Obtener todas las órdenes de compra del proveedor
    const ordenesDeCompra = await prisma.ordenDeCompra.findMany({
      where: { proveedorId },
    });

    return NextResponse.json(ordenesDeCompra);
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes de compra" },
      { status: 500 }
    );
  }
}
