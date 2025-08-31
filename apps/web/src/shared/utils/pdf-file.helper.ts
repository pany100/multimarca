import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileAndGetUrl(pdfFile: File, folder: string) {
  const fileName = pdfFile.name;
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  const secureFileName = `${uuidv4()}.${fileExtension}`;
  const s3ObjectKey = `${folder}/${secureFileName}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3ObjectKey,
    Body: Buffer.from(await pdfFile.arrayBuffer()),
    ContentType: pdfFile.type,
  };

  const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);

  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const region = process.env.AWS_DEFAULT_REGION!;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${s3ObjectKey}`;
}
