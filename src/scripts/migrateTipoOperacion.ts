import { PrismaClient, TipoOperacion } from "@prisma/client";

async function migrateTipoOperacion() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting migration of operation types...");

    // First, get all the TipoDeOperacion records to have their IDs
    const tiposDeOperacion = await prisma.tipoDeOperacion.findMany();

    // Create a mapping from the old enum values to the new TipoDeOperacion IDs
    const operationTypeMap = new Map<TipoOperacion, number>();

    // Find each type by label and map the enum value to its ID
    const efectivoType = tiposDeOperacion.find((t) => t.label === "Efectivo");
    const transferenciaType = tiposDeOperacion.find(
      (t) => t.label === "Transferencia"
    );
    const chequeType = tiposDeOperacion.find((t) => t.label === "Cheque");
    const debitoType = tiposDeOperacion.find(
      (t) => t.label === "Débito Automático Tarjeta Crédito"
    );

    if (efectivoType)
      operationTypeMap.set(TipoOperacion.EFECTIVO, efectivoType.id);
    if (transferenciaType)
      operationTypeMap.set(TipoOperacion.TRANSFERENCIA, transferenciaType.id);
    if (chequeType) operationTypeMap.set(TipoOperacion.CHEQUE, chequeType.id);
    if (debitoType)
      operationTypeMap.set(
        TipoOperacion.DEBITO_AUTOMATICO_TARJETA_CREDITO,
        debitoType.id
      );

    console.log("Operation type mapping:");
    operationTypeMap.forEach((id, enumValue) => {
      console.log(`${enumValue} -> ID: ${id}`);
    });

    // 1. Migrate Extraccion data
    console.log("\nMigrating Extraccion data...");
    const extracciones = await prisma.extraccion.findMany();
    let count = 0;

    for (const extraccion of extracciones) {
      const tipoOperacionId = operationTypeMap.get(extraccion.tipoOperacionOld);

      if (tipoOperacionId) {
        await prisma.extraccion.update({
          where: { id: extraccion.id },
          data: { tipoOperacionId },
        });
        count++;
      }
    }
    console.log(`Migrated ${count} Extraccion records`);

    // 2. Migrate Gasto data
    console.log("\nMigrating Gasto data...");
    const gastos = await prisma.gasto.findMany();
    count = 0;

    for (const gasto of gastos) {
      const tipoOperacionId = operationTypeMap.get(gasto.tipoOperacionOld);

      if (tipoOperacionId) {
        await prisma.gasto.update({
          where: { id: gasto.id },
          data: { tipoOperacionId },
        });
        count++;
      }
    }
    console.log(`Migrated ${count} Gasto records`);

    // 3. Migrate IngresoManualDeDinero data
    console.log("\nMigrating IngresoManualDeDinero data...");
    const ingresos = await prisma.ingresoManualDeDinero.findMany();
    count = 0;

    for (const ingreso of ingresos) {
      const tipoOperacionId = operationTypeMap.get(ingreso.tipoOperacionOld);

      if (tipoOperacionId) {
        await prisma.ingresoManualDeDinero.update({
          where: { id: ingreso.id },
          data: { tipoOperacionId },
        });
        count++;
      }
    }
    console.log(`Migrated ${count} IngresoManualDeDinero records`);

    // 4. Migrate IngresoPorReparacion data
    console.log("\nMigrating IngresoPorReparacion data...");
    const ingresosPorReparacion = await prisma.ingresoPorReparacion.findMany();
    count = 0;

    for (const ingreso of ingresosPorReparacion) {
      const tipoOperacionId = operationTypeMap.get(ingreso.tipoOperacionOld);

      if (tipoOperacionId) {
        await prisma.ingresoPorReparacion.update({
          where: { id: ingreso.id },
          data: { tipoOperacionId },
        });
        count++;
      }
    }
    console.log(`Migrated ${count} IngresoPorReparacion records`);

    // 5. Migrate Venta data
    console.log("\nMigrating Venta data...");
    const ventas = await prisma.venta.findMany();
    count = 0;

    for (const venta of ventas) {
      const tipoOperacionId = operationTypeMap.get(venta.tipoOperacionOld);

      if (tipoOperacionId) {
        await prisma.venta.update({
          where: { id: venta.id },
          data: { tipoOperacionId },
        });
        count++;
      }
    }
    console.log(`Migrated ${count} Venta records`);

    console.log("\nData migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateTipoOperacion()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
