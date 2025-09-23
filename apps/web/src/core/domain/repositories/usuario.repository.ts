import { Prisma } from "@prisma/client";

export type UsuarioWithRoles = Prisma.UsuarioGetPayload<{
  include: {
    rol: true;
  };
}>;

export interface UsuarioRepository {
  findById(id: number): Promise<UsuarioWithRoles | null>;
}
