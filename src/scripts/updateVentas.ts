import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateVentas() {
  console.log("Starting ventas update script...");

  try {
    // Get all ventas with their items
    const ventas = await prisma.venta.findMany({
      include: {
        items: {
          include: {
            stock: true,
          },
        },
        cliente: true,
        cheque: true,
      },
    });

    console.log(`Found ${ventas.length} ventas to process`);

    for (const venta of ventas) {
      console.log(`Processing venta ID: ${venta.id}`);

      // Delete any existing RepuestoUsado for this venta to ensure clean state
      await prisma.repuestoUsado.deleteMany({
        where: {
          ventaId: venta.id,
        },
      });

      // 1. Create RepuestoUsado for each VentaItem
      const items = venta.items;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLastItem = i === items.length - 1;

        // For ventas with multiple items, set precioVenta to 0 for all except the last one
        const precioVenta =
          items.length > 1 ? (isLastItem ? venta.total : 0) : venta.total;

        await prisma.repuestoUsado.create({
          data: {
            ventaId: venta.id,
            stockId: item.stockId,
            precioCompra: item.stock.buyPrice || 0,
            precioVenta: precioVenta,
            unidadesConsumidas: item.cantidad,
          },
        });

        console.log(
          `Created RepuestoUsado for venta ${venta.id}, stock ${item.stockId}, precio venta: ${precioVenta}`
        );
      }

      // 2. Create IngresoPorVenta if it doesn't exist
      const existingIngreso = await prisma.ingresoPorVenta.findFirst({
        where: {
          ventaId: venta.id,
        },
      });

      if (!existingIngreso) {
        // Create base data for IngresoPorVenta
        const ingresoData: any = {
          fecha: venta.fecha,
          clienteId: venta.clienteId || 1, // Use default client ID 1 if not specified
          monto: venta.total,
          descripcion: `Pago por venta #${venta.id}`,
          ventaId: venta.id,
          moneda: venta.moneda,
          dolarId: venta.dolarId,
          tipoOperacionId: venta.tipoOperacionId,
        };

        // If it's a cheque operation (ID = 3), copy the cheque reference
        if (venta.tipoOperacionId === 3 && venta.chequeId) {
          ingresoData.chequeId = venta.chequeId;
        }

        await prisma.ingresoPorVenta.create({
          data: ingresoData,
        });
        console.log(`Created IngresoPorVenta for venta ${venta.id}`);
      } else {
        console.log(`IngresoPorVenta already exists for venta ${venta.id}`);
      }
    }

    console.log("Ventas update completed successfully!");
  } catch (error) {
    console.error("Error updating ventas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateVentas()
  .then(() => {
    console.log("Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
