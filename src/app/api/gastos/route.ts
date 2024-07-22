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
        { nombre: { contains: query } },
        { categoria: { nombre: { contains: query } } },
      ],
    };

    const [gastos, total] = await Promise.all([
      prisma.gasto.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
        include: {
          categoria: true,
          mecanico: true,
          ordenDeCompra: {
            include: {
              proveedor: true,
            },
          },
        },
      }),
      prisma.gasto.count({
        where: whereClause,
      }),
    ]);

    const gastosConProveedor = gastos.map((gasto) => ({
      ...gasto,
      providerId: gasto.ordenDeCompra?.proveedor?.id || null,
    }));

    return NextResponse.json({
      items: gastosConProveedor,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, precio, fecha, categoriaId, mecanicoId, ordenDeCompraId } =
      body;

    if (!nombre || !precio || !fecha || !categoriaId) {
      return NextResponse.json(
        { error: "Datos de gasto inválidos o faltantes" },
        { status: 400 }
      );
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        nombre,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        ordenDeCompraId,
      },
      include: {
        categoria: true,
        mecanico: true,
        ordenDeCompra: true,
      },
    });

    return NextResponse.json(nuevoGasto, { status: 201 });
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json(
      { error: "No se pudo crear el gasto" },
      { status: 500 }
    );
  }
}
