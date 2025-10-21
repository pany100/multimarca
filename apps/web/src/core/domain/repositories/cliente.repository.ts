import { Prisma } from "@prisma/client";

export type ClienteWithRelations = Prisma.ClienteGetPayload<{
  include: {
    cars: {
      include: {
        ordenesReparacion: {
          include: {
            reparacionesDeTercero: true;
            repuestosUsados: {
              include: {
                stock: true;
              };
            };
            trabajosRealizados: true;
            ingresos: {
              include: {
                dolar: true;
              };
            };
          };
          orderBy: {
            fechaCreacion: "desc";
          };
        };
      };
    };
    ventas: {
      include: {
        reparacionesDeTercero: true;
        repuestosUsados: {
          include: {
            stock: true;
          };
        };
        trabajosRealizados: true;
        ingresos: {
          include: {
            dolar: true;
          };
        };
      };
    };
  };
}>;

export interface ClienteRepository {
  findById(id: number): Promise<any | null>;
}
