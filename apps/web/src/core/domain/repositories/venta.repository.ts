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
    cedulaFile: true;
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
    mecanicos: {
      include: {
        mecanico: true;
      };
    };
  };
}>;

export interface VentaRepository {
  create(
    tx: Prisma.TransactionClient,
    input: Prisma.VentaCreateInput
  ): Promise<Venta>;
  listPaged(args: ListVentasParams): Promise<PageResult<VentaWithRelations>>;
  findById(id: number): Promise<VentaWithRelations | null>;
  delete(tx: any, id: number): Promise<void>;
  update(tx: any, data: Prisma.VentaUpdateArgs): Promise<VentaWithRelations>;
  patchVenta(
    id: number,
    dto: {
      clienteId?: number | null;
      informacionCliente?: string | null;
      cedulaFilePath?: string | null;
      fecha?: Date;
      descuento?: number | null;
      descripcionDescuento?: string | null;
      incremento?: number | null;
      descripcionIncremento?: string | null;
      porcentajeRecargo?: number | null;
      estado?: string;
    }
  ): Promise<VentaWithRelations>;

  addMecanicoToVenta(
    ventaId: number,
    mecanicoId: number,
    detalle?: string | null
  ): Promise<any>;

  updateMecanicoInVenta(id: number, detalle?: string | null): Promise<any>;

  deleteMecanicoFromVenta(id: number): Promise<any>;
}
