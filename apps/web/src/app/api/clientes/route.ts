import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          OR: [
            { id: { equals: parseInt(query) || undefined } },
            { fullName: { contains: query } },
            { email: { contains: query } },
            { dni: { contains: query } },
          ],
        },
        include: {
          cars: true,
        },
        skip,
        take: size,
        orderBy: { fullName: "asc" },
      }),
      prisma.cliente.count({
        where: {
          OR: [
            { fullName: { contains: query } },
            { email: { contains: query } },
            { dni: { contains: query } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      items: clientes,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      birthday,
      address,
      city,
      state,
      postal_code,
      tax_status,
      dni,
    } = body;

    // Validar campos obligatorios
    if (!fullName) {
      return NextResponse.json(
        { error: "El nombre completo es obligatorio" },
        { status: 400 }
      );
    }

    // Crear el cliente
    const nuevoCliente = await prisma.cliente.create({
      data: {
        fullName: fullName.toUpperCase(),
        phone: phone || null,
        email: email || null,
        birthday: birthday ? new Date(birthday) : null,
        address: address || null,
        city: city || null,
        state: state || null,
        postal_code: postal_code || null,
        tax_status: tax_status || null,
        dni: dni || null,
        can_receive_notifications: true,
      },
      include: {
        cars: true,
      },
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json(
      { error: "No se pudo crear el cliente" },
      { status: 400 }
    );
  }
}
