import {
  ListStockParams,
  StockRepository,
  StockWithProveedor,
} from "@/core/domain/repositories/stock.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { prismaPaged } from "@/shared/utils/pagination";
import { Prisma } from "@prisma/client";

export class PrismaStockRepository implements StockRepository {
  async listPaged(params: ListStockParams) {
    const {
      page,
      size,
      query = "",
      needsRestock,
      proveedorId,
      sortBy,
      sortOrder,
    } = params;

    // Prisma no permite comparar Decimal vs Int con field references
    // (ej. units (Decimal) <= restockValue (Int)). Para needsRestock usamos SQL raw
    // y luego resolvemos los registros con Prisma (incluyendo relaciones).
    if (needsRestock) {
      const like = `%${query}%`;
      const numericId = parseInt(query || "", 10);
      const hasNumericId = Number.isFinite(numericId);

      const allowedSortFields = new Set([
        "id",
        "name",
        "brand",
        "buyPrice",
        "units",
        "restockValue",
        "proveedorId",
      ]);
      const sortField = allowedSortFields.has(sortBy || "")
        ? (sortBy as string)
        : "id";
      const sortDir = (sortOrder || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

      const whereParts: Prisma.Sql[] = [
        // needsRestock:
        // - si units es NULL => considerar para reposición
        // - si units = 0 => considerar para reposición (aunque restockValue sea NULL)
        // - si hay restockValue => units <= restockValue
        Prisma.sql`(
          s.units IS NULL
          OR s.units = 0
          OR (s.restockValue IS NOT NULL AND s.units <= s.restockValue)
        )`,
      ];
      if (proveedorId) {
        whereParts.push(Prisma.sql`s.proveedorId = ${proveedorId}`);
      }
      if (query) {
        whereParts.push(
          Prisma.sql`(
            ${hasNumericId ? Prisma.sql`s.id = ${numericId}` : Prisma.sql`FALSE`}
            OR s.name LIKE ${like}
            OR s.brand LIKE ${like}
            OR s.label LIKE ${like}
            OR s.reportName LIKE ${like}
            OR s.sector LIKE ${like}
            OR s.carBrand LIKE ${like}
          )`
        );
      }

      const whereSql = Prisma.sql`WHERE ${Prisma.join(whereParts, " AND ")}`;
      const skip = page * size;

      const ids = await prisma.$queryRaw<Array<{ id: number }>>(
        Prisma.sql`
          SELECT s.id
          FROM Stock s
          ${whereSql}
          ORDER BY ${Prisma.raw(`s.${sortField}`)} ${Prisma.raw(sortDir)}
          LIMIT ${size} OFFSET ${skip}
        `
      );

      const countRows = await prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(*) as count
          FROM Stock s
          ${whereSql}
        `
      );
      const total = Number(countRows[0]?.count ?? 0n);

      const idList = ids.map((r) => r.id);
      const items =
        idList.length === 0
          ? []
          : await prisma.stock.findMany({
              where: { id: { in: idList } },
              orderBy: { [sortField]: sortDir.toLowerCase() as any },
              include: { proveedor: true },
            });

      return {
        items,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    }

    let where: any = {
      OR: [
        { id: { equals: parseInt(query || "") || undefined } },
        { name: { contains: query } },
        { brand: { contains: query } },
        { label: { contains: query } },
        { reportName: { contains: query } },
        { sector: { contains: query } },
        { carBrand: { contains: query } },
      ],
    };

    if (proveedorId) {
      where = { AND: [where, { proveedorId }] };
    }

    const orderBy: any = {};
    orderBy[sortBy || "id"] = sortOrder || "desc";

    return prismaPaged<StockWithProveedor>(
      prisma.stock,
      {
        where,
        orderBy,
        include: { proveedor: true },
      },
      page,
      size
    );
  }

  async listAll(): Promise<StockWithProveedor[]> {
    return prisma.stock.findMany({
      orderBy: { name: "asc" },
      include: { proveedor: true },
    });
  }

  async create(
    data: Prisma.StockCreateArgs
  ): Promise<StockWithProveedor> {
    return prisma.stock.create({
      ...data,
      include: { proveedor: true },
    });
  }

  async findById(id: number) {
    return prisma.stock.findUnique({
      where: { id },
      include: { proveedor: true },
    });
  }

  async update(
    data: Prisma.StockUpdateArgs
  ): Promise<StockWithProveedor> {
    return prisma.stock.update({
      ...data,
      include: { proveedor: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.stock.delete({
      where: { id },
    });
  }

  async updatePricesByProveedor(dto: {
    proveedorId: number;
    porcentajeAumento: number;
  }): Promise<void> {
    const factorAumento = 1 + dto.porcentajeAumento / 100;
    await prisma.stock.updateMany({
      where: { proveedorId: dto.proveedorId },
      data: {
        buyPrice: {
          multiply: factorAumento,
        },
      },
    });
  }
}
