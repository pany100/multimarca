import { PresupuestoVO } from "@/core/domain/value-objects/presupuesto.vo";
import { EstadoArchivo, Prisma } from "@prisma/client";

export class PresupuestoDBMapper {
  static transformToCreateData(
    presupuesto: PresupuestoVO
  ): Prisma.PresupuestoCreateArgs {
    return {
      data: {
        autoId: Number(presupuesto.autoId),
        fecha: presupuesto.fecha,
        observacionesCliente: presupuesto.observacionesCliente,
        detallesDeTrabajo: presupuesto.detallesDeTrabajo,
        informacionAuto: presupuesto.informacionAuto,
        informacionCliente: presupuesto.informacionCliente,
        estado: presupuesto.estado,
        dolarId: presupuesto.dolarId,
        descuento: new Prisma.Decimal(presupuesto.descuento),
        porcentajeRecargo: new Prisma.Decimal(presupuesto.porcentajeRecargo),
        descripcionDescuento: presupuesto.descripcionDescuento,
        incrementoInterno: new Prisma.Decimal(presupuesto.incrementoInterno),
        incremento: new Prisma.Decimal(presupuesto.incremento),
        descripcionIncremento: presupuesto.descripcionIncremento,
        repuestosUsados: {
          create: presupuesto.repuestosVO.map((r) => ({
            precioCompra: r.precioCompra.asDecimal(),
            precioVenta: r.precioVenta.asDecimal(),
            unidadesConsumidas: r.unidadesConsumidas,
            stock: { connect: { id: r.stockId } },
          })),
        },
        reparacionesDeTercero: {
          create: presupuesto.tercerosVO.map((t) => ({
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
          create: presupuesto.trabajosVO.map((t) => ({
            descripcion: t.descripcion,
            precioUnitario: t.precioUnitario.asDecimal(),
            diasParaRecordatorio: t.diasParaRecordatorio,
          })),
        },
        tareasAdministrativas: {
          create: presupuesto.tareasAdministrativas,
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        dolar: true,
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        trabajosRealizados: true,
      },
    };
  }
}
