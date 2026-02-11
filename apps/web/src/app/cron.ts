import "src/cron/backup";
import "src/cron/dolar";
import "src/cron/notificacionesCheques";
import "src/cron/notificacionesWhatsappCron";
import "src/cron/s3FileSync";

// Declaramos una variable global para verificar si el cron ya se ha iniciado
declare global {
  var cronJobsStarted: boolean | undefined;
}

export function initCronJobs() {
  // Si los cron jobs ya se han iniciado, no hacemos nada
  if (global.cronJobsStarted) {
    console.log("Cron jobs ya iniciados, saltando inicialización.");
    return;
  }

  console.log("Iniciando cron jobs...");

  require("src/cron/backup").initBackupCron();
  require("src/cron/dolar").initDolarCron();
  require("src/cron/notificacionesWhatsappCron").initNotificacionesWhatsappCron();
  require("src/cron/birthdays").initCumpleañosCron();
  require("src/cron/recordatoriosManoDeObraAClientes").initRecordatoriosManoDeObraAClientesCron();
  require("src/cron/notificacionesCheques").initNotificacionesChequesCron();
  require("src/cron/notificacionesImportantes").initNotificacionesImportantesCron();
  require("src/cron/s3FileSync").initS3FileSyncCron();

  // Marcamos que los cron jobs se han iniciado
  global.cronJobsStarted = true;
  console.log("Cron jobs iniciados exitosamente.");
}

// Esto es necesario para que TypeScript trate este archivo como un módulo
export {};
