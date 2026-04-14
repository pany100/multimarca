import { PageResult } from "@/shared/utils/pagination";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";

export type ListOrdenesParams = {
  page: number;
  size: number;
  query?: string;
  estado?: EstadoOrdenReparacion | string;
  from?: string | null;
  to?: string | null;
};

export type CreateOrdenPersist = {
  data: Prisma.OrdenReparacionCreateArgs;
};

export type UpdateOrdenPersist = {
  data: Prisma.OrdenReparacionUpdateArgs;
};

export type RepuestoFromOrderInDb = {
  stock: {
    id: number;
    name: string;
  };
  unidadesConsumidas: number | Prisma.Decimal;
  precioCompra: number | Prisma.Decimal;
  precioVenta: number | Prisma.Decimal;
};

export type OrdenReparacionWithRelations = Prisma.OrdenReparacionGetPayload<{
  include: {
    auto: {
      include: {
        owner: true;
      };
    };
    mecanicos: {
      include: {
        mecanico: true;
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
    reparacionesDeTercero: {
      include: {
        proveedor: true;
      };
    };
    ingresos: {
      include: {
        dolar: true;
      };
    };
    trabajosRealizados: true;
    revisadoPor: true;
    controlesEnReparacion: {
      include: {
        controlMecanico: {
          include: {
            parent: true;
          };
        };
      };
    };
    pagos: true;
  };
}>;

export type OrdenReparacionWithRelationsForClient =
  Prisma.OrdenReparacionGetPayload<{
    include: {
      auto: {
        include: {
          owner: true;
        };
      };
      mecanicos: true;
      repuestosUsados: {
        include: {
          stock: true;
        };
      };
      reparacionesDeTercero: true;
      trabajosRealizados: true;
      ingresos: {
        include: {
          dolar: true;
        };
      };
    };
  }>;

export interface OrdenReparacionRepository {
  listPaged(params: ListOrdenesParams): Promise<PageResult<any>>;
  findMatchingIdsByFormattedDate(query: string): Promise<number[]>;
  create(tx: any, payload: CreateOrdenPersist["data"]): Promise<any>;
  createDraft(data: Prisma.OrdenReparacionCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  delete(tx: any, id: number): Promise<void>;
  update(
    tx: any,
    payload: UpdateOrdenPersist["data"]
  ): Promise<OrdenReparacionWithRelations>;
  patchOrden(
    id: number,
    dto: {
      autoId?: number;
      kilometros?: number | null;
      observacionesCliente?: string;
      observacionesEntrada?: string;
      estado?: string;
      observacionesInternas?: string;
      observacionesSalida?: string;
      observacionesOcultas?: string | null;
      fechaEntradaReparacion?: Date | null;
      fechaSalidaReparacion?: Date | null;
      controlesEnReparacion?: Array<{ id: number; valor: string }>;
    }
  ): Promise<any>;
  listForCliente(
    clienteId: number
  ): Promise<OrdenReparacionWithRelationsForClient[]>;
  addMecanicoToOrden(
    ordenReparacionId: number,
    mecanicoId: number,
    detalle?: string | null
  ): Promise<any>;
  updateMecanicoInOrden(id: number, detalle?: string | null): Promise<any>;
  deleteMecanicoFromOrden(id: number): Promise<any>;
  addRecibo(ordenId: number, reciboPath: string): Promise<any>;
  deleteRecibo(ordenId: number, reciboPath: string): Promise<any>;
}
