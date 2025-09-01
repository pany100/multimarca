import { ListPresupuestosDto } from "@/core/application/dto/presupuesto.dto";
import { PageResult } from "@/shared/utils/pagination";
import { Presupuesto, Prisma } from "@prisma/client";

export type ListPresupuestosParams = Omit<
  ListPresupuestosDto,
  "page" | "size"
> & {
  page: number;
  size: number;
};

export type PresupuestoWithRelations = Prisma.PresupuestoGetPayload<{
  include: {
    auto: {
      include: {
        owner: true;
      };
    };
    administrativo: true;
    creador: true;
    dolar: true;
    reparacionesDeTercero: {
      include: {
        proveedor: true;
        reciboFile: true;
      };
    };
    repuestosUsados: {
      include: {
        stock: {
          include: {
            proveedor: true;
          };
        };
      };
    };
    trabajosRealizados: true;
    tareasAdministrativas: true;
  };
}>;

export interface PresupuestoRepository {
  listPaged(params: ListPresupuestosParams): Promise<PageResult<any>>;
  create(data: Prisma.PresupuestoCreateArgs): Promise<Presupuesto>;
  findById(id: number): Promise<PresupuestoWithRelations | null>;
  delete(id: number): Promise<void>;
  update(data: Prisma.PresupuestoUpdateArgs): Promise<PresupuestoWithRelations>;
}
