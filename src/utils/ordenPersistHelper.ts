import { Prisma } from "@prisma/client";

type RepuestoUsado = {
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  stock: {
    id: number;
  };
};

type ReparacionesDeTercero = {
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor: {
    id: number;
  };
};

type TrabajoRealizado = {
  descripcion: string;
  precioUnitario: number;
  diasParaRecordatorio: number;
};

function prepareRepuestosToPersist(repuestosUsados: RepuestoUsado[]) {
  return repuestosUsados.map((repuesto: RepuestoUsado) => ({
    precioCompra: repuesto.precioCompra
      ? new Prisma.Decimal(repuesto.precioCompra)
      : new Prisma.Decimal(0),
    precioVenta: repuesto.precioVenta
      ? new Prisma.Decimal(repuesto.precioVenta)
      : new Prisma.Decimal(0),
    unidadesConsumidas: repuesto.unidadesConsumidas,
    stock: { connect: { id: repuesto.stock.id } },
  }));
}

async function prepareReparacionesDeTerceroToPersist(
  reparacionesDeTercero: ReparacionesDeTercero[]
) {
  return await Promise.all(
    reparacionesDeTercero.map(async (reparacion: any) => {
      return {
        nombre: reparacion.nombre,
        precioCompra: reparacion.precioCompra
          ? new Prisma.Decimal(reparacion.precioCompra)
          : new Prisma.Decimal(0),
        precioVenta: reparacion.precioVenta
          ? new Prisma.Decimal(reparacion.precioVenta)
          : new Prisma.Decimal(0),
        proveedor: { connect: { id: reparacion.proveedor.id } },
      };
    })
  );
}

function prepareTrabajosRealizadosToPersist(
  trabajosRealizados: TrabajoRealizado[]
) {
  return trabajosRealizados.map((trabajo: any) => ({
    descripcion: trabajo.manoDeObra.name,
    precioUnitario: new Prisma.Decimal(trabajo.precioUnitario),
    diasParaRecordatorio: trabajo.diasParaRecordatorio,
  }));
}

export {
  prepareReparacionesDeTerceroToPersist,
  prepareRepuestosToPersist,
  prepareTrabajosRealizadosToPersist,
};
