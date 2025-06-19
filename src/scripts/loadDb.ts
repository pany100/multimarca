import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

/**
 * Script para vaciar las tablas de la base de datos y cargar nuevos datos
 * sin borrar la base de datos completa ni perder migraciones
 */

/**
 * Crea un archivo SQL filtrado que contiene solo las sentencias INSERT
 * @param sqlFilePath Ruta al archivo SQL original
 * @returns Ruta al archivo SQL filtrado
 */
async function createFilteredSqlFile(sqlFilePath: string): Promise<string> {
  console.log("🔍 Filtrando archivo SQL para mantener solo los INSERTs...");

  const tempSqlFilePath = path.resolve(`${sqlFilePath}.filtered.sql`);

  try {
    const sqlContent = fs.readFileSync(path.resolve(sqlFilePath), "utf8");

    // Identificar y eliminar bloques de definición de tablas
    let filteredContent = sqlContent;

    // Dividir el contenido en secciones
    const sections = filteredContent.split(/--\s*\n--\s*Dumping data/);

    // La primera parte contiene las estructuras de tablas, la segunda los datos
    if (sections.length > 1) {
      // Eliminar todas las definiciones de estructura y mantener solo la parte de datos
      const dataSection =
        "--\n-- Dumping data" + sections.slice(1).join("--\n-- Dumping data");
      filteredContent = dataSection;
    }

    // Eliminar sentencias DROP TABLE, CREATE TABLE, ALTER TABLE, etc. que pudieran quedar
    const dropCreatePattern = /(DROP|CREATE|ALTER)\s+TABLE[\s\S]*?;/g;
    filteredContent = filteredContent.replace(dropCreatePattern, "");

    // Eliminar líneas con configuraciones de motor, charset, etc.
    const engineConfigPattern = /ENGINE=.*?;/g;
    filteredContent = filteredContent.replace(engineConfigPattern, ";");

    // Eliminar líneas con definiciones de claves
    const keyDefinitionPattern =
      /(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE\s+KEY|KEY).*?(,|\))/g;
    filteredContent = filteredContent.replace(keyDefinitionPattern, "$2");

    // Eliminar líneas con restricciones
    const constraintPattern = /CONSTRAINT.*?(,|\))/g;
    filteredContent = filteredContent.replace(constraintPattern, "$1");

    // Eliminar directivas MySQL específicas
    const mysqlDirectivePattern = /\/\*!.*?\*\//g;
    filteredContent = filteredContent.replace(mysqlDirectivePattern, "");

    // Eliminar líneas SET, LOCK TABLES, UNLOCK TABLES que no sean relevantes para los datos
    const setLockPattern =
      /(SET\s+.*?;|LOCK\s+TABLES.*?;|UNLOCK\s+TABLES;|DISABLE\s+KEYS;|ENABLE\s+KEYS;)/g;
    filteredContent = filteredContent.replace(setLockPattern, "");

    // Eliminar líneas vacías múltiples y limpiar el contenido
    filteredContent = filteredContent
      .replace(/\n{3,}/g, "\n\n") // Reemplazar 3 o más saltos de línea por 2
      .replace(/,\s*\)/g, ")") // Eliminar comas antes de paréntesis de cierre
      .replace(/,\s*;/g, ";"); // Eliminar comas antes de punto y coma

    // Mantener solo las líneas INSERT y eliminar cualquier referencia a _prisma_migrations
    const lines = filteredContent.split("\n");
    const filteredLines = lines.filter((line) => {
      // Ignorar líneas vacías o solo con espacios
      if (!line.trim()) return false;

      // Eliminar cualquier línea relacionada con _prisma_migrations
      if (line.toLowerCase().includes("_prisma_migrations")) return false;

      // Mantener líneas INSERT y comentarios relevantes
      return (
        line.trim().startsWith("INSERT") ||
        line.trim().startsWith("--") ||
        line.trim() === ""
      );
    });

    fs.writeFileSync(tempSqlFilePath, filteredLines.join("\n"), "utf8");
    console.log(`✅ Archivo filtrado guardado en: ${tempSqlFilePath}`);
    return tempSqlFilePath;
  } catch (error) {
    console.error("❌ Error al filtrar el archivo SQL:", error);
    throw error;
  }
}

/**
 * Vacía todas las tablas de la base de datos sin eliminar su estructura
 */
async function truncateTables(): Promise<void> {
  console.log("🧹 Vaciando tablas...");

  // Obtener las tablas en orden de dependencia (primero las que no tienen claves foráneas)
  // Nota: Este orden es importante para evitar errores de restricción de clave foránea
  const tablesToEmpty = [
    "_CategoriaGastoToRol",
    "_PermisoToRol",
    // Tablas sin dependencias o con pocas dependencias
    "Permiso",
    "Rol",
    "ControlMecanico",
    "CategoriaGasto",
    "ManoDeObra",
    "Feriado",
    "TipoDeOperacion",
    "Dolar",

    // Tablas con dependencias básicas
    "Usuario",
    "Cliente",
    "Proveedor",
    "Empleado",
    "Cheque",

    // Tablas de nivel medio
    "Auto",
    "Stock",
    "Gasto",
    "NotificacionWhatsapp",
    "RecordatorioAgenda",
    "Turno",

    // Tablas con múltiples dependencias
    "OrdenDeCompra",
    "OrdenDeCompraItem",
    "OrdenReparacion",
    "OrdenReparacionMecanico",
    "Presupuesto",
    "PlantillaPresupuesto",
    "Venta",
    "RepuestoUsado",
    "ReparacionDeTercero",
    "TrabajoRealizado",
    "ControlEnReparacion",
    "PagoAMecanico",
    "IngresoManualDeDinero",
    "IngresoPorReparacion",
    "IngresoPorVenta",
    "Extraccion",
    "NotificacionInterna",
    "ConversacionWhatsApp",
    "MensajeWhatsApp",
    "TareaAdministrativa",
  ];

  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

    // Vaciar cada tabla sin borrarla
    for (const table of tablesToEmpty) {
      try {
        console.log(`🗑️ Vaciando tabla: ${table}`);
        // TRUNCATE elimina todos los registros pero mantiene la estructura de la tabla
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      } catch (error) {
        console.error(`Error al vaciar la tabla ${table}:`, error);
        throw error;
      }
    }

    // Reactivar las restricciones de clave foránea
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
  } catch (error) {
    console.error("❌ Error al vaciar tablas:", error);
    throw error;
  }
}

/**
 * Importa un archivo SQL filtrado a la base de datos
 * @param filteredSqlFilePath Ruta al archivo SQL filtrado
 */
async function importSqlFile(filteredSqlFilePath: string): Promise<void> {
  console.log("📥 Cargando datos desde archivo SQL filtrado...");

  try {
    // Extraer información de la conexión de la URL de la base de datos
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("No se encontró la variable de entorno DATABASE_URL");
    }

    // Parseamos la URL de conexión para extraer los datos necesarios
    const dbUrlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const matches = dbUrl.match(dbUrlPattern);

    if (!matches || matches.length < 6) {
      throw new Error(
        "No se pudo extraer la información de conexión del DATABASE_URL"
      );
    }

    const [, user, password, host, port, database] = matches;

    // Ejecutar el comando de mysql para importar el archivo SQL
    console.log("🚀 Ejecutando importación SQL...");

    // Crear un archivo temporal con comandos para deshabilitar/habilitar las restricciones de clave foránea
    const tempCommandsPath = `${filteredSqlFilePath}.commands.sql`;
    fs.writeFileSync(
      tempCommandsPath,
      `SET FOREIGN_KEY_CHECKS=0;\n` +
        fs.readFileSync(filteredSqlFilePath, "utf8") +
        `\nSET FOREIGN_KEY_CHECKS=1;`,
      "utf8"
    );

    const command = `mysql -u${user} -p${password} -h127.0.0.1 -P${port} ${database} < "${tempCommandsPath}"`;
    execSync(command, { stdio: "inherit" });

    console.log("✅ Archivo SQL importado correctamente");

    // Eliminar archivos temporales
    fs.unlinkSync(filteredSqlFilePath);
    fs.unlinkSync(tempCommandsPath);
    console.log("🧹 Archivos temporales eliminados");
  } catch (error) {
    console.error("❌ Error al importar el archivo SQL:", error);
    throw error;
  }
}

/**
 * Script para vaciar las tablas de la base de datos y cargar nuevos datos
 * sin borrar la base de datos completa ni perder migraciones
 */
async function loadDb() {
  try {
    console.log("🔄 Iniciando proceso de carga de base de datos...");

    // Ruta al archivo de datos SQL
    const sqlFilePath = process.argv[2];
    if (!sqlFilePath) {
      throw new Error(
        "Debes proporcionar la ruta al archivo SQL como argumento"
      );
    }

    console.log(`📂 Usando archivo SQL: ${sqlFilePath}`);

    // Verificar que el archivo existe
    if (!fs.existsSync(path.resolve(sqlFilePath))) {
      throw new Error(`El archivo SQL no existe en la ruta: ${sqlFilePath}`);
    }

    // 1. Crear archivo SQL filtrado
    const filteredSqlFilePath = await createFilteredSqlFile(sqlFilePath);

    // 2. Vaciar tablas
    await truncateTables();

    // 3. Importar archivo SQL filtrado
    await importSqlFile(filteredSqlFilePath);

    console.log("✅ Proceso completado con éxito");
  } catch (error) {
    console.error("❌ Error durante el proceso:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función principal
loadDb();
