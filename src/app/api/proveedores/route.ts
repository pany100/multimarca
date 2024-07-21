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
          name: { contains: query },
        },
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.proveedor.count({
        where: {
          name: { contains: query },
        },
      }),
    ]);

    return NextResponse.json({
      items: proveedores,
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
    const { name, address, email, phone, mobile, iva, cuit } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de proveedor inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        name,
        address,
        email,
        phone,
        mobile,
        iva,
        cuit,
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
