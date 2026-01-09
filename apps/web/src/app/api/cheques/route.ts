import { getOperacionesByChequeId } from "@/utils/chequeUtils";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause: any = {
      OR: [
        { id: { equals: parseInt(query) || undefined } },
        { numero: { contains: query } },
        { banco: { contains: query } },
        { owner: { contains: query } },
      ],
    };

    // If there's a query, add formatted date search for both fechaEmision and fechaCobro
    if (query && query.trim() !== "") {
      // Use raw query to find cheques where the formatted dates contain the query
      const formattedDateMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM Cheque 
        WHERE DATE_FORMAT(fechaEmision, '%e/%c/%Y') LIKE ${`%${query}%`}
        OR DATE_FORMAT(fechaCobro, '%e/%c/%Y') LIKE ${`%${query}%`}
      `;

      // Only add to OR clause if we found matches
      if (formattedDateMatches.length > 0) {
        const matchingIds = formattedDateMatches.map((match) => match.id);
        whereClause.OR.push({ id: { in: matchingIds } });
      }
    }

    const [cheques, total] = await Promise.all([
      prisma.cheque.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fechaCobro: "asc" },
      }),
      prisma.cheque.count({
        where: whereClause,
      }),
    ]);

    // Get operations for each cheque
    const chequesWithOperaciones = await Promise.all(
      cheques.map(async (cheque) => {
        const operaciones = await getOperacionesByChequeId(cheque.id);
        return {
          ...cheque,
          rechazado: cheque.rechazado ? "Si" : "No",
          operaciones,
        };
      })
    );

    return NextResponse.json({
      items: chequesWithOperaciones,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener cheques:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
