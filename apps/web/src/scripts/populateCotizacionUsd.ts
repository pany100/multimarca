import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function populateCotizacionUsd() {
  console.log("🚀 Iniciando población de cotizacionDolar...");

  try {
    // 1. Actualizar Extraccion
    console.log("📊 Actualizando Extraccion...");
    const extraccionResult = await prisma.$executeRaw`
      UPDATE \`Extraccion\` 
      JOIN \`Dolar\` ON \`Extraccion\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`Extraccion\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`Extraccion\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(`✅ Extraccion: ${extraccionResult} registros actualizados`);

    // 2. Actualizar Gasto
    console.log("📊 Actualizando Gasto...");
    const gastoResult = await prisma.$executeRaw`
      UPDATE \`Gasto\` 
      JOIN \`Dolar\` ON \`Gasto\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`Gasto\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`Gasto\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(`✅ Gasto: ${gastoResult} registros actualizados`);

    // 3. Actualizar IngresoPorReparacion
    console.log("📊 Actualizando IngresoPorReparacion...");
    const ingresoReparacionResult = await prisma.$executeRaw`
      UPDATE \`IngresoPorReparacion\` 
      JOIN \`Dolar\` ON \`IngresoPorReparacion\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`IngresoPorReparacion\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`IngresoPorReparacion\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(
      `✅ IngresoPorReparacion: ${ingresoReparacionResult} registros actualizados`
    );

    // 4. Actualizar IngresoPorVenta
    console.log("📊 Actualizando IngresoPorVenta...");
    const ingresoVentaResult = await prisma.$executeRaw`
      UPDATE \`IngresoPorVenta\` 
      JOIN \`Dolar\` ON \`IngresoPorVenta\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`IngresoPorVenta\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`IngresoPorVenta\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(
      `✅ IngresoPorVenta: ${ingresoVentaResult} registros actualizados`
    );

    // 5. Actualizar IngresoManualDeDinero
    console.log("📊 Actualizando IngresoManualDeDinero...");
    const ingresoManualResult = await prisma.$executeRaw`
      UPDATE \`IngresoManualDeDinero\` 
      JOIN \`Dolar\` ON \`IngresoManualDeDinero\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`IngresoManualDeDinero\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`IngresoManualDeDinero\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(
      `✅ IngresoManualDeDinero: ${ingresoManualResult} registros actualizados`
    );

    // 6. Actualizar Perdidas
    console.log("📊 Actualizando Perdidas...");
    const perdidasResult = await prisma.$executeRaw`
      UPDATE \`Perdidas\` 
      JOIN \`Dolar\` ON \`Perdidas\`.\`dolarId\` = \`Dolar\`.\`id\`
      SET \`Perdidas\`.\`cotizacionDolar\` = \`Dolar\`.\`blue\`
      WHERE \`Perdidas\`.\`cotizacionDolar\` IS NULL
    `;
    console.log(`✅ Perdidas: ${perdidasResult} registros actualizados`);

    const totalUpdated =
      Number(extraccionResult) +
      Number(gastoResult) +
      Number(ingresoReparacionResult) +
      Number(ingresoVentaResult) +
      Number(ingresoManualResult) +
      Number(perdidasResult);

    console.log(`\n🎉 Proceso completado exitosamente!`);
    console.log(`📈 Total de registros actualizados: ${totalUpdated}`);
    console.log(`\nResumen por modelo:`);
    console.log(`- Extraccion: ${extraccionResult}`);
    console.log(`- Gasto: ${gastoResult}`);
    console.log(`- IngresoPorReparacion: ${ingresoReparacionResult}`);
    console.log(`- IngresoPorVenta: ${ingresoVentaResult}`);
    console.log(`- IngresoManualDeDinero: ${ingresoManualResult}`);
    console.log(`- Perdidas: ${perdidasResult}`);
  } catch (error) {
    console.error("❌ Error durante la población de cotizacionDolar:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

populateCotizacionUsd()
  .then(() => {
    console.log("✨ Script ejecutado correctamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error ejecutando el script:", error);
    process.exit(1);
  });
