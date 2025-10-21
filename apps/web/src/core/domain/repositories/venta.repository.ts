import type { ListVentasQueryDto } from "@/core/application/dto/venta.dto";
import { PageResult } from "@/shared/utils/pagination";
import type { Prisma, Venta } from "@prisma/client";

export type ListVentasParams = Omit<ListVentasQueryDto, "page" | "size"> & {
  page: number;
  size: number;
};

export type VentaWithRelations = Prisma.VentaGetPayload<{
  include: {
    cliente: true;
    repuestosUsados: {
      include: {
        stock: true;
      };
    };
    reparacionesDeTercero: {
      include: {
        proveedor: true;
        reciboFile: true;
      };
    };
    trabajosRealizados: true;
    ingresos: {
      include: {
        dolar: true;
      };
    };
  };
}>;

export interface VentaRepository {
  create(
    tx: Prisma.TransactionClient,
    input: Prisma.VentaCreateInput
  ): Promise<Venta>;
  listPaged(args: ListVentasParams): Promise<PageResult<Venta>>;
  findById(id: number): Promise<VentaWithRelations | null>;
  delete(tx: any, id: number): Promise<void>;
  update(tx: any, data: Prisma.VentaUpdateArgs): Promise<VentaWithRelations>;
}
