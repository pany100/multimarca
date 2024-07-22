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

    // Filtrar las órdenes de compra que no están pagadas completamente
    const ordenesPendientes = ordenesDeCompra.filter((orden) => {
      const totalPagado = orden.gastos.reduce(
        (sum, gasto) => sum + Number(gasto.precio),
        0
      );
      return Number(orden.precioTotal) > totalPagado;
    });

    if (ordenesPendientes.length > 0) {
      // Mapear las órdenes pendientes a un formato más adecuado para la respuesta
      const resultado = ordenesPendientes.map((orden) => ({
        id: orden.id,
        fecha: orden.fecha,
        precioTotal: orden.precioTotal,
        totalPagado: orden.gastos.reduce(
          (sum, gasto) => sum + Number(gasto.precio),
          0
        ),
        deuda:
          Number(orden.precioTotal) -
          orden.gastos.reduce((sum, gasto) => sum + Number(gasto.precio), 0),
      }));

      return NextResponse.json(resultado);
    } else {
      return NextResponse.json(
        {
          message:
            "No se encontraron órdenes de compra pendientes para este proveedor",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al obtener órdenes de compra pendientes:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes de compra pendientes" },
      { status: 500 }
    );
  }
}
