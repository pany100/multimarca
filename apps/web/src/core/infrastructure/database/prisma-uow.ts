import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export class PrismaUnitOfWork implements UnitOfWork {
  async run<T>(
    fn: (deps: { tx: Prisma.TransactionClient }) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(async (tx) => fn({ tx }), {
      timeout: 60000, // 60 seconds
    });
  }
}
