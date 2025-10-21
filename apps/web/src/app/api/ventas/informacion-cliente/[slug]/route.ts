import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import prisma from "@/lib/prisma";
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
        estado: {
          not: "Presupuestado",
        },
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
          stock: { id: 0, name: "" },
          unidadesConsumidas: r.unidadesConsumidas,
          precioVenta: Number(r.precioVenta),
          precioCompra: 0,
        })),
        reparacionesDeTercero: venta.reparacionesDeTercero.map((r) => ({
          nombre: "",
          proveedor: { id: 0 },
          precioVenta: Number(r.precioVenta),
          precioCompra: 0,
        })),
        trabajosRealizados: venta.trabajosRealizados.map((t) => ({
          precioUnitario: Number(t.precioUnitario),
          descripcion: "",
        })),
        descuento: Number(venta.descuento),
        incremento: Number(venta.incremento),
        porcentajeRecargo: Number(venta.porcentajeRecargo),
        incrementoInterno: 0,
      };
      const calculoVO =
        ComprobanteCalculadoFactory.fromPrecioDto(ventaParaCalculo);
      return {
        ...venta,
        totalAPagar: calculoVO.total,
        totalPagado: calculoVO.totalPagado,
        deuda: calculoVO.deuda,
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
