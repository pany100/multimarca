import { PrismaClient } from "@prisma/client";

async function createTipoOperacion() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting creation of TipoDeOperacion records...");

    // Define the operation types that match the previous enum values
    const operationTypes = [
      { label: "Efectivo" },
      { label: "Transferencia" },
      { label: "Cheque" },
      { label: "Débito Automático Tarjeta Crédito" },
    ];

    // Create each operation type
    for (const type of operationTypes) {
      // Check if the operation type already exists to avoid duplicates
      const existing = await prisma.tipoDeOperacion.findUnique({
        where: { label: type.label },
      });

      if (!existing) {
        await prisma.tipoDeOperacion.create({
          data: type,
        });
        console.log(`Created operation type: ${type.label}`);
      } else {
        console.log(`Operation type already exists: ${type.label}`);
      }
    }

    // Verify all operation types were created
    const allTypes = await prisma.tipoDeOperacion.findMany();
    console.log("All operation types in database:");
    allTypes.forEach((type) => {
      console.log(`ID: ${type.id}, Label: ${type.label}`);
    });

    console.log("Operation types creation completed successfully");
  } catch (error) {
    console.error("Error during operation types creation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTipoOperacion()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
