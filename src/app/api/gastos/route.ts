import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    // Obtener el token de la cabecera de autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    // Obtener el rol del usuario desde la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decodedToken.userId },
      include: {
        rol: true,
      },
    });

    if (!user || !user.rol) {
      return NextResponse.json(
        { error: "Usuario no tiene rol asignado" },
        { status: 403 }
      );
    }
    const skip = page * size;

    const whereClause = {
      OR: [
        { nombre: { contains: query } },
        { categoria: { nombre: { contains: query } } },
        { mecanico: { name: { contains: query } } },
      ],
      AND: [
        {
          categoria: {
            OR: [
              { roles: { none: {} } },
              { roles: { some: { name: user.rol.name } } },
            ],
          },
        },
      ],
    };

    const [gastos, total] = await Promise.all([
      prisma.gasto.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          categoria: {
            include: {
              roles: true,
            },
          },
          mecanico: true,
          proveedor: true,
        },
      }),
      prisma.gasto.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: gastos,
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
    const {
      nombre,
      precio,
      fecha,
      categoriaId,
      mecanicoId,
      tipo,
      proveedorId,
      moneda,
      detalle,
    } = body;

    if (!nombre || !precio || !fecha || !categoriaId) {
      return NextResponse.json(
        { error: "Datos de gasto inválidos o faltantes" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
        { status: 400 }
      );
    }

    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: new Date(fecha),
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const nuevoGasto = await prisma.gasto.create({
      data: {
        nombre,
        moneda,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        proveedorId,
        tipo,
        detalle,
        dolarId: dolar?.id,
      },
      include: {
        categoria: true,
        mecanico: true,
        proveedor: true,
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
