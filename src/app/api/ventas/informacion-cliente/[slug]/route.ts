import prisma from "@/lib/prisma";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const soloConDeuda = searchParams.get("soloConDeuda") === "true";

    const ventas = await prisma.venta.findMany({
      where: {
        informacionCliente: params.slug,
        presupuesto: false,
      },
      include: {
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const ventasConDeuda = ventas.map((venta) => {
      const ventaParaCalculo = {
        ...venta,
        repuestosUsados: venta.repuestosUsados.map((r) => ({
          precioVenta: Number(r.precioVenta),
          unidadesConsumidas: r.unidadesConsumidas,
        })),
        reparacionesDeTercero: venta.reparacionesDeTercero.map((r) => ({
          precioVenta: Number(r.precioVenta),
        })),
        trabajosRealizados: venta.trabajosRealizados.map((t) => ({
          precioUnitario: Number(t.precioUnitario),
        })),
        descuento: Number(venta.descuento),
        incremento: Number(venta.incremento),
      };
      const totalAPagar = calcularTotalOrdenReparacion(ventaParaCalculo);
      const totalPagado = venta.ingresos.reduce((sum, ingreso) => {
        if (ingreso.moneda === "Dolar") {
          return sum + Number(ingreso.monto) * Number(ingreso.dolar?.blue);
        }
        return sum + Number(ingreso.monto);
      }, 0);

      return {
        ...venta,
        totalAPagar,
        totalPagado,
        deuda: totalAPagar - totalPagado,
      };
    });
    if (soloConDeuda) {
      return NextResponse.json(
        ventasConDeuda.filter(
          (venta) => venta.deuda > 0 || venta.totalAPagar === 0
        )
      );
    }

    return NextResponse.json(ventasConDeuda);
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
