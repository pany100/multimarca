import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { AusenciaProgramada } from "@prisma/client";
import { CreateAusenciaProgramadaSchema, UpdateAusenciaProgramadaSchema } from "../../validation/schemas/ausencia.schema";

export class PrismaAusenciaProgramadaRepository implements AusenciaProgramadaRepository {
  create(data: CreateAusenciaProgramadaSchema): Promise<AusenciaProgramada> {
    return prisma.ausenciaProgramada.create({
      data,
    });
  }
  update(data: UpdateAusenciaProgramadaSchema): Promise<AusenciaProgramada> {
    return prisma.ausenciaProgramada.update({
      where: { id: data.id },
      data,
    });
  }
  delete(id: number): Promise<AusenciaProgramada | null> {
    return prisma.ausenciaProgramada.delete({
      where: { id },
    });
  }
  get(id: number): Promise<AusenciaProgramada | null> {
    return prisma.ausenciaProgramada.findUnique({
      where: { id },
    });
  }
}
