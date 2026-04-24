import { VentaVO } from "@/core/domain/value-objects/venta.vo";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { EstadoArchivo, Prisma } from "@prisma/client";

export function mapVentaVOToPrismaCreate(vo: VentaVO): Prisma.VentaCreateInput {
  const {
    clienteId,
    informacionCliente,
    cedulaTempPath,
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

  if (cedulaTempPath && clienteId == null) assertTempPathInTmp(cedulaTempPath);
  for (const t of tercerosVO) {
    if (t.recibo) assertTempPathInTmp(t.recibo);
  }

  return {
    fecha,
    informacionCliente,
    estado,
    dolar: dolarId ? { connect: { id: dolarId } } : undefined,
    cliente: clienteId ? { connect: { id: clienteId } } : undefined,
    ...(cedulaTempPath &&
      clienteId == null && {
        cedulaFile: {
          create: {
            tempPath: cedulaTempPath,
            finalPath: null,
            status: EstadoArchivo.Pendiente,
          },
        },
      }),

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
      create: trabajosVO.map((t) => ({
        descripcion: t.descripcion,
        precioUnitario: t.precioUnitario.asDecimal(),
        diasParaRecordatorio: t.diasParaRecordatorio,
      })),
    },
  };
}

export function mapVentaVOToPrismaUpdate(vo: VentaVO): Prisma.VentaUpdateArgs {
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
  if (!vo.id) {
    throw new Error("No se proporciono un id");
  }
  for (const t of tercerosVO) {
    if (t.recibo) assertTempPathInTmp(t.recibo);
  }
  return {
    where: { id: vo.id },
    data: {
      clienteId,
      informacionCliente,
      fecha,
      dolarId,
      estado,
      descuento: new Prisma.Decimal(priceAdjustmentsVO.descuento),
      descripcionDescuento,
      incremento: new Prisma.Decimal(priceAdjustmentsVO.incremento),
      descripcionIncremento,
      porcentajeRecargo: new Prisma.Decimal(
        priceAdjustmentsVO.porcentajeRecargo
      ),
      repuestosUsados: {
        deleteMany: {},
        create: vo.repuestosVO.map((r) => ({
          precioCompra: r.precioCompra.asDecimal(),
          precioVenta: r.precioVenta.asDecimal(),
          unidadesConsumidas: r.unidadesConsumidas,
          stock: { connect: { id: r.stockId } },
        })),
      },
      reparacionesDeTercero: {
        deleteMany: {},
        create: vo.tercerosVO.map((t) => ({
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
        deleteMany: {},
        create: vo.trabajosVO.map((t) => ({
          descripcion: t.descripcion,
          precioUnitario: t.precioUnitario.asDecimal(),
          diasParaRecordatorio: t.diasParaRecordatorio,
        })),
      },
    },
  };
}
