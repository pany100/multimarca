import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { EstadoArchivo, Prisma } from "@prisma/client";

export class OrdenReparacionDBMapper {
  static transformToCreateData(ordenReparacion: OrdenReparacionVO) {
    for (const t of ordenReparacion.tercerosVO) {
      if (t.recibo) assertTempPathInTmp(t.recibo);
    }
    return {
      data: {
        autoId: Number(ordenReparacion.autoId),
        fechaCreacion: ordenReparacion.fechaCreacion,
        fechaEntradaReparacion: ordenReparacion.fechaEntradaReparacion ?? null,
        fechaSalidaReparacion: ordenReparacion.fechaSalidaReparacion ?? null,
        dolarId: ordenReparacion.dolarId ?? null,
        kilometros: ordenReparacion.kilometros ?? null,
        observacionesCliente: ordenReparacion.observacionesCliente,
        observacionesOcultas: ordenReparacion.observacionesOcultas ?? null,
        observacionesEntrada: ordenReparacion.observacionesEntrada ?? "[]",
        observacionesSalida: ordenReparacion.observacionesSalida ?? "[]",
        estado: ordenReparacion.estado.toPrisma(),
        pdfPath: ordenReparacion.pdfPath ?? null,
        descuento: new Prisma.Decimal(ordenReparacion.descuento),
        descripcionDescuento: ordenReparacion.descripcionDescuento ?? null,
        incremento: new Prisma.Decimal(ordenReparacion.incremento),
        descripcionIncremento: ordenReparacion.descripcionIncremento ?? null,
        incrementoInterno: new Prisma.Decimal(
          ordenReparacion.incrementoInterno
        ),
        porcentajeRecargo: new Prisma.Decimal(
          ordenReparacion.porcentajeRecargo
        ),

        mecanicos: {
          create: ordenReparacion.mecanicosVO.map((m) => ({
            mecanicoId: m.id,
            detalle: m.detalle,
          })),
        },
        repuestosUsados: {
          create: ordenReparacion.repuestosVO.map((r) => ({
            precioCompra: r.precioCompra.asDecimal(),
            precioVenta: r.precioVenta.asDecimal(),
            unidadesConsumidas: r.unidadesConsumidas,
            stock: { connect: { id: r.stockId } },
          })),
        },
        reparacionesDeTercero: {
          create: ordenReparacion.tercerosVO.map((t) => ({
            nombre: t.nombre,
            cantidad: t.cantidad,
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
          create: ordenReparacion.trabajosVO.map((t) => ({
            descripcion: t.descripcion,
            precioUnitario: t.precioUnitario.asDecimal(),
            diasParaRecordatorio: t.diasParaRecordatorio,
          })),
        },
        controlesEnReparacion: {
          create: ordenReparacion.controlesEnReparacion.map((c: any) => ({
            controlMecanicoId: c.id,
            valor: c.type === "checkbox" ? "false" : "",
          })),
        },
      },
      include: {
        auto: { include: { owner: true } },
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        controlesEnReparacion: true,
        pagos: true,
      },
    };
  }

  static transformToUpdateData(ordenReparacion: OrdenReparacionVO) {
    if (ordenReparacion.pdfPath) assertTempPathInTmp(ordenReparacion.pdfPath);
    for (const t of ordenReparacion.tercerosVO) {
      if (t.recibo) assertTempPathInTmp(t.recibo);
    }
    for (const r of ordenReparacion.recibos ?? []) {
      assertTempPathInTmp(r);
    }
    return {
      where: { id: Number(ordenReparacion.id) },
      data: {
        autoId: ordenReparacion.autoId,
        fechaEntradaReparacion: ordenReparacion.fechaEntradaReparacion,
        fechaSalidaReparacion: ordenReparacion.fechaSalidaReparacion,
        fechaCreacion: ordenReparacion.fechaCreacion,
        kilometros: ordenReparacion.kilometros,
        observacionesCliente: ordenReparacion.observacionesCliente,
        observacionesEntrada: ordenReparacion.observacionesEntrada,
        observacionesOcultas: ordenReparacion.observacionesOcultas,
        observacionesSalida: ordenReparacion.observacionesSalida,
        estado: ordenReparacion.estado.toPrisma(),
        revisadoPorId: ordenReparacion.revisadoPorId,
        dolarId: ordenReparacion.dolarId,
        descuento: new Prisma.Decimal(ordenReparacion.descuento),
        porcentajeRecargo: new Prisma.Decimal(
          ordenReparacion.porcentajeRecargo
        ),
        mecanicos: {
          deleteMany: {},
          create: ordenReparacion.mecanicosVO.map((m) => ({
            mecanicoId: m.id,
            detalle: m.detalle,
          })),
        },
        repuestosUsados: {
          deleteMany: {},
          create: ordenReparacion.repuestosVO.map((r) => ({
            precioCompra: r.precioCompra.asDecimal(),
            precioVenta: r.precioVenta.asDecimal(),
            unidadesConsumidas: r.unidadesConsumidas,
            stockId: r.stockId,
          })),
        },
        reparacionesDeTercero: {
          deleteMany: {},
          create: ordenReparacion.tercerosVO.map((t) => ({
            nombre: t.nombre,
            cantidad: t.cantidad,
            precioCompra: t.precioCompra.asDecimal(),
            precioVenta: t.precioVenta.asDecimal(),
            proveedorId: t.proveedorId,
            recibo: t.recibo,
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
          deleteMany: {},
          create: ordenReparacion.trabajosVO.map((t) => ({
            descripcion: t.descripcion,
            precioUnitario: t.precioUnitario.asDecimal(),
            diasParaRecordatorio: t.diasParaRecordatorio,
          })),
        },
        controlesEnReparacion: {
          upsert: ordenReparacion.controlesEnReparacion.map((control: any) => ({
            where: { id: control.id },
            update: {
              valor: control.valor,
            },
            create: {
              controlMecanicoId: control.id,
              valor: control.valor,
            },
          })),
        },
        detalleControles: ordenReparacion.detalleControles,
        descripcionDescuento: ordenReparacion.descripcionDescuento,
        incremento: new Prisma.Decimal(ordenReparacion.incremento),
        descripcionIncremento: ordenReparacion.descripcionIncremento,
        incrementoInterno: new Prisma.Decimal(
          ordenReparacion.incrementoInterno
        ),
        scannerFile: ordenReparacion.pdfPath?.includes("/tmp/")
          ? {
              create: {
                tempPath: ordenReparacion.pdfPath,
                status: EstadoArchivo.Pendiente,
              },
            }
          : undefined,
        recibosFiles: {
          create: ordenReparacion.recibos.map((r) => ({
            tempPath: r,
            status: EstadoArchivo.Pendiente,
          })),
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        revisadoPor: true,
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        controlesEnReparacion: true,
        pagos: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
      },
    };
  }
}
