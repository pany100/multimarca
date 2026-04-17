import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause = {
      OR: [
        { proveedor: { name: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    const [ordenesDeCompra, total] = await Promise.all([
      prisma.ordenDeCompra.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          proveedor: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
      }),
      prisma.ordenDeCompra.count({
        where: whereClause,
      }),
    ]);

    const ordenesDeCompraConLabel = ordenesDeCompra.map((orden) => ({
      ...orden,
      items: orden.items.map((item) => ({
        ...item,
        name: item.stock.name,
        label: item.stock.label,
        stockId: item.stock.id,
      })),
    }));

    return NextResponse.json({
      items: ordenesDeCompraConLabel,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, precioTotal, proveedorId, items, percepcion } = body;

    if (!fecha || !proveedorId) {
      return NextResponse.json(
        { error: "Fecha y proveedor son requeridos" },
        { status: 400 }
      );
    }

    const itemsArray = Array.isArray(items) ? items : [];
    const percepcionNum = Number(percepcion) || 0;

    // Calcular precioTotal a partir de los items + percepcion
    const precioTotalCalculado = itemsArray.reduce((total: number, item: any) => {
      const precio = Number(item.precioUnitario) || 0;
      const iva = Number(item.iva) || 0;
      return total + precio * (1 + iva / 100) * Number(item.cantidad);
    }, 0) + percepcionNum;

    const nuevaOrdenDeCompra = await prisma.$transaction(async (prisma) => {
      const ordenCreada = await prisma.ordenDeCompra.create({
        data: {
          fecha: fecha ? new Date(fecha) : new Date(),
          proveedorId,
          precioTotal: precioTotalCalculado,
          percepcion: percepcionNum,
          ...(itemsArray.length > 0 && {
            items: {
              create: itemsArray.map((item: any) => ({
                cantidad: item.cantidad,
                stockId: item.stockId,
                precioUnitario: item.precioUnitario ?? null,
                iva: item.iva ?? null,
              })),
            },
          }),
        },
        include: {
          proveedor: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      for (const item of itemsArray) {
        const stock = await prisma.stock.findUnique({
          where: { id: item.stockId },
          select: { units: true },
        });

        await prisma.stock.update({
          where: { id: item.stockId },
          data: {
            units:
              stock?.units === null
                ? item.cantidad
                : {
                    increment: item.cantidad,
                  },
          },
        });
      }

      return ordenCreada;
    });

    const ordenDeCompraConLabel = {
      ...nuevaOrdenDeCompra,
      items: nuevaOrdenDeCompra.items.map((item) => ({
        ...item,
        name: item.stock.name,
        label: item.stock.label,
        stockId: item.stock.id,
      })),
    };

    return NextResponse.json(ordenDeCompraConLabel, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de compra:", error);
    return NextResponse.json(
      { error: "No se pudo crear la orden de compra" },
      { status: 500 }
    );
  }
}
