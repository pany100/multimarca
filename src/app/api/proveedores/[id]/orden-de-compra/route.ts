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
      include: {
        gastos: true,
      },
    });

    if (ordenesDeCompra.length > 0) {
      // Mapear todas las órdenes a un formato más adecuado para la respuesta
      const resultado = ordenesDeCompra.map((orden) => {
        const totalPagado = orden.gastos.reduce(
          (sum, gasto) => sum + Number(gasto.precio),
          0
        );
        return {
          id: orden.id,
          fecha: orden.fecha,
          precioTotal: orden.precioTotal,
          totalPagado: totalPagado,
          deuda: Number(orden.precioTotal) - totalPagado,
        };
      });

      return NextResponse.json(resultado);
    } else {
      return NextResponse.json(
        {
          message: "No se encontraron órdenes de compra para este proveedor",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes de compra" },
      { status: 500 }
    );
  }
}
