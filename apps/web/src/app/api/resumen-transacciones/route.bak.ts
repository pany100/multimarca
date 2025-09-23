import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

// Tipo para representar una transacción genérica
type Transaccion = {
  id: number;
  fecha: Date;
  monto: number;
  descripcion?: string;
  tipo: string;
  entidad: string;
  entidadId: number;
  tipoOperacionId?: number;
  tipoOperacion?: {
    id: number;
    label: string;
    esIngreso: boolean;
    esGasto: boolean;
  };
  detalleEntidad?: string;
  moneda: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const tipoOperacionId = searchParams.get("tipoOperacionId") || null;
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    // Obtener el token de la cabecera de autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));

    // Obtener el rol del usuario desde la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decodedToken.userId },
      include: {
        rol: true,
      },
    });

    if (!user || !user.rol) {
      return NextResponse.json(
        { error: "Usuario no tiene rol asignado" },
        { status: 403 }
      );
    }

    const skip = page * size;

    // Filtro por tipoOperacionId si se proporciona
    const tipoOperacionFilter = tipoOperacionId
      ? { tipoOperacionId: parseInt(tipoOperacionId) }
      : {};

    const ingresoManualWhere: any = {
      ...tipoOperacionFilter,
      OR: [
        { usuario: { fullName: { contains: query } } },
        { descripcion: { contains: query } },
      ],
    };

    if (fromDate || toDate) {
      ingresoManualWhere.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        ingresoManualWhere.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        ingresoManualWhere.fecha.lte = endDate;
      }
    }

    // Búsqueda en IngresoManualDeDinero
    const ingresoManualPromise = prisma.ingresoManualDeDinero.findMany({
      where: ingresoManualWhere,
      include: {
        usuario: true,
        tipoOperacion: true,
      },
      orderBy: { fecha: "desc" },
    });

    const ingresoPorVentaWhere: any = {
      ...tipoOperacionFilter,
      OR: [
        { cliente: { fullName: { contains: query } } },
        { informacionCliente: { contains: query } },
        { descripcion: { contains: query } },
      ],
    };

    if (fromDate || toDate) {
      ingresoPorVentaWhere.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        ingresoPorVentaWhere.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        ingresoPorVentaWhere.fecha.lte = endDate;
      }
    }

    // Búsqueda en IngresoPorVenta
    const ingresoPorVentaPromise = prisma.ingresoPorVenta.findMany({
      where: ingresoPorVentaWhere,
      include: {
        cliente: true,
        tipoOperacion: true,
      },
      orderBy: { fecha: "desc" },
    });

    const ingresoPorReparacionWhere: any = {
      ...tipoOperacionFilter,
      OR: [
        { cliente: { fullName: { contains: query } } },
        { ordenReparacion: { auto: { patent: { contains: query } } } },
        { descripcion: { contains: query } },
      ],
    };

    if (fromDate || toDate) {
      ingresoPorReparacionWhere.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        ingresoPorReparacionWhere.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        ingresoPorReparacionWhere.fecha.lte = endDate;
      }
    }

    // Búsqueda en IngresoPorReparacion
    const ingresoPorReparacionPromise = prisma.ingresoPorReparacion.findMany({
      where: ingresoPorReparacionWhere,
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
          },
        },
        tipoOperacion: true,
      },
      orderBy: { fecha: "desc" },
    });

    const gastoWhere: any = {
      ...tipoOperacionFilter,
      OR: [
        { categoria: { nombre: { contains: query } } },
        { proveedor: { name: { contains: query } } },
        { nombre: { contains: query } },
        { detalle: { contains: query } },
      ],
      AND: [
        {
          categoria: {
            OR: [
              { roles: { none: {} } },
              { roles: { some: { name: user.rol.name } } },
            ],
          },
        },
      ],
    };

    if (fromDate || toDate) {
      gastoWhere.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        gastoWhere.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        gastoWhere.fecha.lte = endDate;
      }
    }

    // Búsqueda en Gasto
    const gastoPromise = prisma.gasto.findMany({
      where: gastoWhere,
      include: {
        categoria: true,
        proveedor: true,
        tipoOperacion: true,
      },
      orderBy: { fecha: "desc" },
    });

    const extraccionWhere: any = {
      ...tipoOperacionFilter,
      OR: [
        { usuario: { fullName: { contains: query } } },
        { motivo: { contains: query } },
      ],
    };

    if (fromDate || toDate) {
      extraccionWhere.fecha = {};

      if (fromDate) {
        // Convertir YYYY-MM-DD a objeto Date
        extraccionWhere.fecha.gte = new Date(fromDate);
      }

      if (toDate) {
        // Convertir YYYY-MM-DD a objeto Date y establecer a final del día
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        extraccionWhere.fecha.lte = endDate;
      }
    }

    // Búsqueda en Extraccion
    const extraccionPromise = prisma.extraccion.findMany({
      where: extraccionWhere,
      include: {
        usuario: true,
        tipoOperacion: true,
      },
      orderBy: { fecha: "desc" },
    });

    // Ejecutar todas las consultas en paralelo
    const [
      ingresosManuales,
      ingresosPorVenta,
      ingresosPorReparacion,
      gastos,
      extracciones,
      totalIngresosManuales,
      totalIngresosPorVenta,
      totalIngresosPorReparacion,
      totalGastos,
      totalExtracciones,
    ] = await Promise.all([
      ingresoManualPromise,
      ingresoPorVentaPromise,
      ingresoPorReparacionPromise,
      gastoPromise,
      extraccionPromise,
      prisma.ingresoManualDeDinero.count({ where: ingresoManualWhere }),
      prisma.ingresoPorVenta.count({ where: ingresoPorVentaWhere }),
      prisma.ingresoPorReparacion.count({ where: ingresoPorReparacionWhere }),
      prisma.gasto.count({ where: gastoWhere }),
      prisma.extraccion.count({ where: extraccionWhere }),
    ]);

    // Mapear los resultados a un formato común
    const transacciones: Transaccion[] = [
      ...ingresosManuales.map((ingreso) => ({
        id: ingreso.id,
        fecha: ingreso.fecha,
        monto: Number(ingreso.monto),
        descripcion: ingreso.descripcion || "",
        tipo: "IngresoManualDeDinero",
        entidad: "Usuario",
        entidadId: ingreso.usuarioId,
        tipoOperacionId: ingreso.tipoOperacionId || undefined,
        tipoOperacion: ingreso.tipoOperacion || undefined,
        detalleEntidad: ingreso.usuario?.fullName || "",
        moneda: ingreso.moneda,
      })),
      ...ingresosPorVenta.map((ingreso) => ({
        id: ingreso.id,
        fecha: ingreso.fecha,
        monto: Number(ingreso.monto),
        descripcion: ingreso.descripcion,
        tipo: "IngresoPorVenta",
        entidad: "Cliente",
        entidadId: ingreso.clienteId || 0,
        tipoOperacionId: ingreso.tipoOperacionId || undefined,
        tipoOperacion: ingreso.tipoOperacion || undefined,
        detalleEntidad:
          ingreso.cliente?.fullName || ingreso.informacionCliente || "",
        moneda: ingreso.moneda,
        ventaId: ingreso.ventaId,
      })),
      ...ingresosPorReparacion.map((ingreso) => ({
        id: ingreso.id,
        fecha: ingreso.fecha,
        monto: Number(ingreso.monto),
        descripcion: ingreso.descripcion,
        tipo: "IngresoPorReparacion",
        entidad: "Cliente",
        entidadId: ingreso.clienteId,
        tipoOperacionId: ingreso.tipoOperacionId || undefined,
        tipoOperacion: ingreso.tipoOperacion || undefined,
        detalleEntidad: ingreso.cliente?.fullName || "",
        moneda: ingreso.moneda,
        ordenReparacionId: ingreso.ordenReparacionId,
        patente: ingreso.ordenReparacion?.auto?.patent || "",
      })),
      ...gastos.map((gasto) => ({
        id: gasto.id,
        fecha: gasto.fecha,
        monto: Number(gasto.precio),
        descripcion: gasto.detalle || gasto.nombre,
        tipo: "Gasto",
        entidad: gasto.proveedorId ? "Proveedor" : "Categoría",
        entidadId: gasto.proveedorId || gasto.categoriaId,
        tipoOperacionId: gasto.tipoOperacionId || undefined,
        tipoOperacion: gasto.tipoOperacion || undefined,
        detalleEntidad: gasto.proveedor?.name || gasto.categoria?.nombre || "",
        moneda: gasto.moneda,
      })),
      ...extracciones.map((extraccion) => ({
        id: extraccion.id,
        fecha: extraccion.fecha,
        monto: Number(extraccion.monto),
        descripcion: extraccion.motivo,
        tipo: "Extraccion",
        entidad: "Usuario",
        entidadId: extraccion.usuarioId,
        tipoOperacionId: extraccion.tipoOperacionId || undefined,
        tipoOperacion: extraccion.tipoOperacion || undefined,
        detalleEntidad: extraccion.usuario?.fullName || "",
        moneda: extraccion.moneda,
      })),
    ];

    // Ordenar todas las transacciones por fecha (más reciente primero)
    const transaccionesOrdenadas = transacciones.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    // Aplicar paginación
    const totalItems =
      totalIngresosManuales +
      totalIngresosPorVenta +
      totalIngresosPorReparacion +
      totalGastos +
      totalExtracciones;

    const transaccionesPaginadas = transaccionesOrdenadas.slice(
      skip,
      skip + size
    );

    return NextResponse.json({
      items: transaccionesPaginadas,
      total: totalItems,
      page,
      size,
      totalPages: Math.ceil(totalItems / size),
    });
  } catch (error) {
    console.error("Error al obtener resumen de transacciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
