import { Moneda } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Obtener datos del proveedor
    const proveedor = await prisma.proveedor.findUnique({
      where: { id },
      select: {
        name: true,
      },
    });

    if (!proveedor) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    // Obtener órdenes de compra del proveedor
    const ordenesDeCompra = await prisma.ordenDeCompra.findMany({
      where: { proveedorId: id },
      select: {
        id: true,
        fecha: true,
        precioTotal: true,
      },
    });

    // Obtener reparaciones de terceros del proveedor
    const reparacionesTercero = await prisma.reparacionDeTercero.findMany({
      where: { proveedorId: id, ordenReparacion: { isNot: null } },
      select: {
        precioCompra: true,
        nombre: true,
        ordenReparacion: {
          select: {
            fechaCreacion: true,
            dolar: true,
            id: true,
          },
        },
      },
    });

    // Obtener pagos a proveedores
    const pagos = await prisma.gasto.findMany({
      where: {
        proveedorId: id,
        categoria: {
          nombre: "Pago Proveedores",
        },
      },
      include: {
        dolar: true,
      },
    });

    // Combinar y formatear todos los movimientos
    const movimientos = [
      ...ordenesDeCompra.map((oc) => ({
        fecha: oc.fecha,
        monto: Number(oc.precioTotal),
        tipo: "Deuda" as const,
        descripcion: `Orden de compra del ${new Date(
          oc.fecha
        ).toLocaleDateString()}`,
        ref: `/dashboard/orden-de-compra/${oc.id}/ver`,
      })),
      ...reparacionesTercero.map((rt) => ({
        fecha: rt.ordenReparacion?.fechaCreacion || new Date(),
        monto: Number(rt.precioCompra),
        tipo: "Deuda" as const,
        descripcion: `Reparación de tercero: ${rt.nombre} - Orden #${rt.ordenReparacion?.id}`,
        ref: `/dashboard/ordenes-reparacion/${rt.ordenReparacion?.id}/ver`,
      })),
      ...pagos.map((p) => ({
        fecha: p.fecha,
        monto:
          p.moneda === Moneda.Dolar && p.dolar
            ? Number(p.precio) * Number(p.dolar.blue)
            : Number(p.precio),
        tipo: "Pago" as const,
        descripcion: p.detalle || "Pago a proveedor",
        ref: `/dashboard/gastos/${p.id}`,
      })),
    ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    // Calcular saldo total (positivo = a favor, negativo = deuda)
    const saldoTotal = movimientos.reduce((acc, mov) => {
      return acc + (mov.tipo === "Deuda" ? -mov.monto : mov.monto);
    }, 0);

    // Paginar resultados
    const total = movimientos.length;
    const paginatedMovimientos = movimientos.slice(skip, skip + pageSize);

    return NextResponse.json({
      items: paginatedMovimientos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      saldoTotal,
      nombreProveedor: proveedor.name,
    });
  } catch (error) {
    console.error("Error al obtener estado de cuenta del proveedor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
        name: name.toUpperCase(),
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
