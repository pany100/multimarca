import { Prisma } from "@prisma/client";

export type ClienteWithRelations = Prisma.ClienteGetPayload<{
  include: {
    cars: {
      include: {
        ordenesReparacion: {
          include: {
            repuestosUsados: true;
            reparacionesDeTercero: true;
            trabajosRealizados: true;
            auto: true;
            ingresos: true;
          };
          orderBy: {
            fechaCreacion: "desc";
          };
        };
      };
    };
    ventas: {
      include: {
        ingresos: true;
      };
    };
  };
}>;

export interface ClienteRepository {
  findById(id: number): Promise<any | null>;
}
