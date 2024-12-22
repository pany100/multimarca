import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export async function moveFileInS3(
  sourceUrl: string,
  destinationFolder: string
): Promise<string> {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Extraer el bucket y la key del sourceUrl
    const urlParts = sourceUrl.replace("https://", "").split("/");
    const bucket = urlParts[0].split(".")[0];
    const sourceKey = urlParts.slice(1).join("/");

    // Crear la nueva key con el destinationFolder
    const fileName = sourceKey.split("/").pop() || "";
    const destinationKey = `${destinationFolder}/${fileName}`;

    // Copiar el archivo a la nueva ubicación
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destinationKey,
      })
    );

    // Eliminar el archivo original
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: sourceKey,
      })
    );

    // Retornar la nueva URL
    return `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${destinationKey}`;
  } catch (error) {
    console.error("Error moviendo archivo en S3:", error);
    throw error;
  }
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

    // Extraer el bucket y la key del fileUrl
    const urlParts = fileUrl.replace("https://", "").split("/");
    const bucket = urlParts[0].split(".")[0];
    const key = urlParts.slice(1).join("/");

    // Eliminar el archivo
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Error eliminando archivo de S3:", error);
    throw error;
  }
}
