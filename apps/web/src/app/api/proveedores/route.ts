import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where: {
          OR: [
            { id: { equals: parseInt(query) || undefined } },
            { name: { contains: query } },
          ],
        },
        skip,
        take: size,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          address: true,
          email: true,
          phone: true,
          mobile: true,
          iva: true,
          cuit: true,
          numeroProveedor: true,
          gastos: {
            select: {
              precio: true,
            },
          },
          ordenesDeCompra: {
            select: {
              precioTotal: true,
            },
          },
        },
      }),
      prisma.proveedor.count({
        where: {
          name: { contains: query },
        },
      }),
    ]);

    const proveedoresConEstadoCuenta = proveedores.map((proveedor) => {
      const totalGastos = proveedor.gastos.reduce(
        (sum, gasto) => sum + Number(gasto.precio),
        0
      );
      const totalOrdenesCompra = proveedor.ordenesDeCompra.reduce(
        (sum, orden) => sum + Number(orden.precioTotal),
        0
      );
      const estadoCuenta = totalGastos - totalOrdenesCompra;

      return {
        ...proveedor,
        estadoCuenta,
      };
    });

    return NextResponse.json({
      items: proveedoresConEstadoCuenta,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, email, phone, mobile, iva, cuit, numeroProveedor } =
      body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de proveedor inválido o faltante" },
        { status: 400 }
      );
    }
    // Verificar si ya existe un proveedor con el mismo numeroProveedor
    const cantProveedores = await prisma.proveedor.count({
      where: { numeroProveedor: parseInt(numeroProveedor) },
    });

    if (cantProveedores > 0) {
      return NextResponse.json(
        { error: "Nombre de proveedor repetido" },
        { status: 400 }
      );
    }

    const nuevoProveedor = await prisma.proveedor.create({
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

    return NextResponse.json(nuevoProveedor, { status: 201 });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json(
      { error: "No se pudo crear el proveedor" },
      { status: 500 }
    );
  }
}
