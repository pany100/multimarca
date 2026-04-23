/**
 * Valida que `tempPath` apunte a la carpeta `tmp/` del bucket S3.
 *
 * Invariante del dominio: `CustomFile` siempre se crea con un `tempPath` en
 * `tmp/`. La promoción a la carpeta final (cedula-verde, recibos, dni, etc.)
 * la realiza exclusivamente el cron `s3FileSync`. Subir un archivo directamente
 * a la carpeta final y usar esa URL como `tempPath` rompe la promoción
 * (self-copy en S3) y genera filas en estado `Error`.
 */
export function assertTempPathInTmp(tempPath: string): void {
  if (!tempPath.includes("/tmp/")) {
    throw new Error(
      `CustomFile.tempPath debe estar en /tmp/. Recibido: ${tempPath}. ` +
        `Subí el archivo vía /api/upload-tmp-file; la promoción a la carpeta final la hace el cron s3FileSync.`,
    );
  }
}
