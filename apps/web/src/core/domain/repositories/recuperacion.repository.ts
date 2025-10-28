import { Prisma } from "@prisma/client";

export type CreateRecuperacionPersist = {
  data: Prisma.RecuperacionCreateArgs;
};

export type UpdateRecuperacionPersist = {
  data: Prisma.RecuperacionUpdateArgs;
};

export type RecuperacionWithRelations = Prisma.RecuperacionGetPayload<{}>;

export interface RecuperacionRepository {
  findByPerdidaId(perdidaId: number): Promise<RecuperacionWithRelations[]>;
  
  findById(id: number): Promise<RecuperacionWithRelations | null>;
  
  create(params: CreateRecuperacionPersist): Promise<RecuperacionWithRelations>;
  
  update(params: UpdateRecuperacionPersist): Promise<RecuperacionWithRelations>;
  
  delete(id: number): Promise<void>;
}
