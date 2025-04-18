import { PrismaClient } from "@prisma/client";

async function populateOperations() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting data migration for operation types...");

    // 1. Migrate Extraccion data
    console.log("Migrating Extraccion data...");
    const extracciones = await prisma.extraccion.findMany();
    let count = 0;

    for (const extraccion of extracciones) {
      await prisma.extraccion.update({
        where: { id: extraccion.id },
        data: {
          tipoOperacionOld: extraccion.tipoExtraccion,
        },
      });
      count++;
    }
    console.log(`Migrated ${count} Extraccion records`);

    // 2. Migrate Gasto data
    console.log("Migrating Gasto data...");
    const gastos = await prisma.gasto.findMany();
    count = 0;

    for (const gasto of gastos) {
      await prisma.gasto.update({
        where: { id: gasto.id },
        data: {
          tipoOperacionOld: gasto.tipo,
        },
      });
      count++;
    }
    console.log(`Migrated ${count} Gasto records`);

    // 3. Migrate IngresoManualDeDinero data
    console.log("Migrating IngresoManualDeDinero data...");
    const ingresos = await prisma.ingresoManualDeDinero.findMany();
    count = 0;

    for (const ingreso of ingresos) {
      await prisma.ingresoManualDeDinero.update({
        where: { id: ingreso.id },
        data: {
          tipoOperacionOld: ingreso.tipoExtraccion,
        },
      });
      count++;
    }
    console.log(`Migrated ${count} IngresoManualDeDinero records`);

    // 4. Migrate IngresoPorReparacion data
    console.log("Migrating IngresoPorReparacion data...");
    const ingresosPorReparacion = await prisma.ingresoPorReparacion.findMany();
    count = 0;

    for (const ingreso of ingresosPorReparacion) {
      await prisma.ingresoPorReparacion.update({
        where: { id: ingreso.id },
        data: {
          tipoOperacionOld: ingreso.tipoOperacion,
        },
      });
      count++;
    }
    console.log(`Migrated ${count} IngresoPorReparacion records`);

    // 5. Migrate Venta data
    console.log("Migrating Venta data...");
    const ventas = await prisma.venta.findMany();
    count = 0;

    for (const venta of ventas) {
      await prisma.venta.update({
        where: { id: venta.id },
        data: {
          tipoOperacionOld: venta.tipoOperacion,
        },
      });
      count++;
    }
    console.log(`Migrated ${count} Venta records`);

    console.log("Data migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
populateOperations()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
