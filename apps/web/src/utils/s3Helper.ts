import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// NOTA: este módulo lo toca código cliente a través de chequeUtils.ts (importado
// por forms *.tsx). No importar "@/lib/logger" aquí — winston-daily-rotate-file
// arrastra `fs` al bundle del browser y rompe el build.

export async function moveFileInS3(
  sourceUrl: string,
  destinationFolder: string
): Promise<string> {
  const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const urlParts = sourceUrl.replace("https://", "").split("/");
  const bucket = urlParts[0].split(".")[0];
  const sourceKey = urlParts.slice(1).join("/");

  const fileName = sourceKey.split("/").pop() || "";
  const destinationKey = `${destinationFolder}/${fileName}`;
  const destinationUrl = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${destinationKey}`;

  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destinationKey,
      })
    );
  } catch (error: any) {
    console.error("[s3Helper] Error copiando archivo en S3", {
      sourceUrl,
      destinationFolder,
      sourceKey,
      destinationKey,
      awsCode: error?.Code,
      awsName: error?.name,
      message: error?.message,
    });
    throw error;
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: sourceKey,
      })
    );
  } catch (error: any) {
    // El copy ya fue exitoso — el archivo está seguro en su destino final.
    // El tmp quedará hasta que expire por lifecycle del bucket (7 días).
    console.warn(
      "[s3Helper] Copy OK pero delete del tmp falló — archivo final OK, tmp quedará hasta caducar por TTL",
      {
        sourceUrl,
        sourceKey,
        destinationKey,
        awsCode: error?.Code,
        awsName: error?.name,
        message: error?.message,
      }
    );
  }

  return destinationUrl;
}

export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const urlParts = fileUrl.replace("https://", "").split("/");
    const bucket = urlParts[0].split(".")[0];
    const key = urlParts.slice(1).join("/");

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error: any) {
    console.error("[s3Helper] Error eliminando archivo de S3", {
      fileUrl,
      awsCode: error?.Code,
      awsName: error?.name,
      message: error?.message,
    });
    throw error;
  }
}
