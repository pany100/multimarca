import {
  UsuarioRepository,
  UsuarioWithRoles,
} from "@/core/domain/repositories/usuario.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor() {}

  findById(id: number): Promise<UsuarioWithRoles | null> {
    return prisma.usuario.findUnique({ where: { id }, include: { rol: true } });
  }
}
