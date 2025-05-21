import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    // Get all clients
    const allClients = await prisma.cliente.findMany({
      where: {
        OR: [
          { fullName: { contains: query } },
          { email: { contains: query } },
          { dni: { contains: query } },
        ],
      },
      include: {
        cars: true,
      },
    });

    // Process each client to determine if they have pending payments
    const deudoresPromises = allClients.map(async (cliente) => {
      // Get all sales for this client
      const ventas = await prisma.venta.findMany({
        where: {
          clienteId: cliente.id,
          presupuesto: false, // Only actual sales, not quotes
        },
        include: {
          ingresos: true,
          repuestosUsados: true,
          trabajosRealizados: true,
          reparacionesDeTercero: true,
        },
      });

      // Get car IDs for this client
      const carIds = cliente.cars.map((car) => car.id);

      // Get all repair orders for this client's cars
      const ordenesReparacion = await prisma.ordenReparacion.findMany({
        where: {
          autoId: {
            in: carIds,
          },
          estado: {
            not: "Presupuestado", // Exclude quotes
          },
        },
        include: {
          auto: {
            select: {
              brand: true,
              model: true,
              patent: true,
            },
          },
          ingresos: true,
          repuestosUsados: true,
          trabajosRealizados: true,
          reparacionesDeTercero: true,
        },
      });

      // Calculate total amount for sales
      const ventasDeuda = ventas
        .map((venta) => {
          // Calculate total cost of the sale
          const repuestosTotal = venta.repuestosUsados.reduce(
            (sum, repuesto) =>
              sum + Number(repuesto.precioVenta) * repuesto.unidadesConsumidas,
            0
          );

          const trabajosTotal = venta.trabajosRealizados.reduce(
            (sum, trabajo) => sum + Number(trabajo.precioUnitario),
            0
          );

          const reparacionesTerceroTotal = venta.reparacionesDeTercero.reduce(
            (sum, reparacion) => sum + Number(reparacion.precioVenta),
            0
          );

          // Apply discount and increment
          const subtotal =
            repuestosTotal + trabajosTotal + reparacionesTerceroTotal;
          const totalConDescuento = subtotal - Number(venta.descuento);
          const totalFinal = totalConDescuento + Number(venta.incremento);

          // Calculate total payments
          const pagosTotal = venta.ingresos.reduce(
            (sum, ingreso) => sum + Number(ingreso.monto),
            0
          );

          // Calculate pending amount
          const pendiente = totalFinal - pagosTotal;

          return {
            id: venta.id,
            fecha: venta.fecha,
            tipo: "Venta",
            total: totalFinal,
            pagado: pagosTotal,
            pendiente: pendiente > 0 ? pendiente : 0,
          };
        })
        .filter((venta) => venta.pendiente > 0);

      // Calculate total amount for repair orders
      const reparacionesDeuda = ordenesReparacion
        .map((orden) => {
          // Calculate total cost of the repair
          const repuestosTotal = orden.repuestosUsados.reduce(
            (sum, repuesto) =>
              sum + Number(repuesto.precioVenta) * repuesto.unidadesConsumidas,
            0
          );

          const trabajosTotal = orden.trabajosRealizados.reduce(
            (sum, trabajo) => sum + Number(trabajo.precioUnitario),
            0
          );

          const reparacionesTerceroTotal = orden.reparacionesDeTercero.reduce(
            (sum, reparacion) => sum + Number(reparacion.precioVenta),
            0
          );

          // Apply discount and increment
          const subtotal =
            repuestosTotal + trabajosTotal + reparacionesTerceroTotal;
          const totalConDescuento = subtotal - Number(orden.descuento);
          const totalFinal = totalConDescuento + Number(orden.incremento);

          // Calculate total payments
          const pagosTotal = orden.ingresos.reduce(
            (sum, ingreso) => sum + Number(ingreso.monto),
            0
          );

          // Calculate pending amount
          const pendiente = totalFinal - pagosTotal;

          const auto = orden.auto;

          return {
            id: orden.id,
            fecha: orden.fechaCreacion,
            tipo: "Reparación",
            total: totalFinal,
            pagado: pagosTotal,
            pendiente: pendiente > 0 ? pendiente : 0,
            auto: auto ? `${auto.brand} ${auto.model} (${auto.patent})` : "",
          };
        })
        .filter((orden) => orden.pendiente > 0);

      // If client has pending payments, return client with debt details
      if (ventasDeuda.length > 0 || reparacionesDeuda.length > 0) {
        const totalDeuda =
          ventasDeuda.reduce((sum, venta) => sum + venta.pendiente, 0) +
          reparacionesDeuda.reduce((sum, orden) => sum + orden.pendiente, 0);

        return {
          id: cliente.id,
          fullName: cliente.fullName,
          email: cliente.email,
          phone: cliente.phone,
          dni: cliente.dni,
          totalDeuda,
          ventas: ventasDeuda,
          reparaciones: reparacionesDeuda,
        };
      }

      return null;
    });

    // Wait for all promises to resolve
    const deudoresResults = await Promise.all(deudoresPromises);

    // Filter out null results (clients without debt)
    const deudores = deudoresResults.filter((deudor) => deudor !== null);

    // Sort by total debt (highest first)
    deudores.sort((a, b) => b.totalDeuda - a.totalDeuda);

    // Apply pagination
    const paginatedDeudores = deudores.slice(skip, skip + size);

    return NextResponse.json({
      items: paginatedDeudores,
      total: deudores.length,
      page,
      size,
      totalPages: Math.ceil(deudores.length / size),
    });
  } catch (error) {
    console.error("Error al obtener deudores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
