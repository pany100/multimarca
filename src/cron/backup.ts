import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import fs from "fs";
import cron from "node-cron";
import path from "path";

const prisma = new PrismaClient();

async function realizarBackup() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando backup de la base de datos`
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, "");
    const nombreArchivo = `dump_${process.env.DATABASE_NAME}_${timestamp}.sql`;
    const directorioBackup = path.join(process.cwd(), "backups");

    if (!fs.existsSync(directorioBackup)) {
      fs.mkdirSync(directorioBackup);
    }

    const rutaCompleta = path.join(directorioBackup, nombreArchivo);

    const comando = `mysqldump -h 127.0.0.1 -P 3306 -u${process.env.DATABASE_USER} -p${process.env.DATABASE_PASSWORD} ${process.env.DATABASE_NAME} > ${rutaCompleta}`;

    exec(comando, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al realizar el backup: ${error}`);
        return;
      }
      console.log(`Backup completado exitosamente: ${rutaCompleta}`);

      const s3Client = new S3Client({
        region: process.env.AWS_DEFAULT_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const fileContent = fs.readFileSync(rutaCompleta);
      const s3ObjectKey = `dumps/${nombreArchivo}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3ObjectKey,
        Body: fileContent,
      };

      try {
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        console.log(`Backup subido exitosamente a S3: ${s3ObjectKey}`);
        // Eliminar el archivo de backup local después de subirlo a S3
        fs.unlink(rutaCompleta, (err) => {
          if (err) {
            console.error(
              `Error al eliminar el archivo de backup local: ${err}`
            );
          } else {
            console.log(`Archivo de backup local eliminado: ${rutaCompleta}`);
          }
        });
      } catch (uploadError) {
        console.error("Error al subir el backup a S3:", uploadError);
      }
    });
  } catch (error) {
    console.error("Error al realizar el backup:", error);
  }
}

export function initBackupCron() {
  cron.schedule("* * * * *", realizarBackup, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  });

  console.log("Cron job para backup de la base de datos iniciado");
}
