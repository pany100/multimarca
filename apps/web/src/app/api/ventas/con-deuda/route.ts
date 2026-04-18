import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

const ventaInclude = {
  repuestosUsados: {
    include: { stock: true },
  },
  reparacionesDeTercero: {
    include: { proveedor: true, reciboFile: true },
  },
  trabajosRealizados: true,
  ingresos: {
    include: { dolar: true },
  },
  cliente: true,
  ajustesPrecio: true,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const queryAsNumber = parseInt(query);
    const isNumericQuery = !isNaN(queryAsNumber);

    const ventas = await prisma.venta.findMany({
      where: {
        estado: { not: "Presupuestado" },
        OR: [
          ...(isNumericQuery ? [{ id: queryAsNumber }] : []),
          { cliente: { fullName: { contains: query } } },
          { informacionCliente: { contains: query } },
        ],
      },
      include: ventaInclude,
      orderBy: { fecha: "desc" },
      take: 20,
    });

    const ventasConDeuda = ventas
      .map((venta) => {
        const calculoVO = ComprobanteCalculadoFactory.fromVenta(venta);
        return {
          id: venta.id,
          fecha: venta.fecha,
          estado: venta.estado,
          clienteId: venta.clienteId,
          informacionCliente: venta.informacionCliente,
          clienteNombre: venta.cliente?.fullName || venta.informacionCliente,
          totalAPagar: calculoVO.total,
          totalPagado: calculoVO.totalPagado,
          deuda: calculoVO.deuda,
        };
      })
      .filter((venta) => venta.deuda > 0 || venta.totalAPagar === 0);

    return NextResponse.json(ventasConDeuda);
  } catch (e) {
    return handleApiError(e);
  }
}
