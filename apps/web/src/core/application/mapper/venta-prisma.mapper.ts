import { VentaVO } from "@/core/domain/value-objects/venta.vo";
import { EstadoArchivo, Prisma } from "@prisma/client";

export function mapVentaVOToPrismaCreate(vo: VentaVO): Prisma.VentaCreateInput {
  const {
    clienteId,
    informacionCliente,
    fecha,
    estado,
    priceAdjustmentsVO,
    descripcionDescuento,
    descripcionIncremento,
    repuestosVO,
    trabajosVO,
    tercerosVO,
    dolarId,
  } = vo;

  return {
    fecha,
    informacionCliente,
    estado,
    dolar: dolarId ? { connect: { id: dolarId } } : undefined,
    cliente: clienteId ? { connect: { id: clienteId } } : undefined,

    descuento: new Prisma.Decimal(priceAdjustmentsVO.descuento),
    descripcionDescuento,
    incremento: new Prisma.Decimal(priceAdjustmentsVO.incremento),
    descripcionIncremento,
    porcentajeRecargo: new Prisma.Decimal(priceAdjustmentsVO.porcentajeRecargo),

    repuestosUsados: {
      create: repuestosVO.map((r) => ({
        precioCompra: r.precioCompra.asDecimal(),
        precioVenta: r.precioVenta.asDecimal(),
        unidadesConsumidas: r.unidadesConsumidas,
        stock: { connect: { id: r.stockId } },
      })),
    },
    reparacionesDeTercero: {
      create: tercerosVO.map((t) => ({
        nombre: t.nombre,
        precioCompra: t.precioCompra.asDecimal(),
        precioVenta: t.precioVenta.asDecimal(),
        proveedor: { connect: { id: t.proveedorId } },
        ...(t.recibo && {
          reciboFile: {
            create: {
              tempPath: t.recibo,
              finalPath: null,
              status: EstadoArchivo.Pendiente,
            },
          },
        }),
      })),
    },
    trabajosRealizados: {
      create: trabajosVO.map((t) => ({
        descripcion: t.descripcion,
        precioUnitario: t.precioUnitario.asDecimal(),
        diasParaRecordatorio: t.diasParaRecordatorio,
      })),
    },
  };
}
