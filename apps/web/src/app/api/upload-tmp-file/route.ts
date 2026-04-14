import logger from "@/lib/logger";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
const maxFileSize = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { mensaje: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { mensaje: "El archivo es demasiado grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { mensaje: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    const secureFileName = `${uuidv4()}.${fileExtension}`;
    const s3ObjectKey = `tmp/${secureFileName}`;

    let contentType = file.type;
    if (fileExtension === "pdf" && !contentType) {
      contentType = "application/pdf";
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3ObjectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: contentType,
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
    const permanentUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3ObjectKey}`;

    logger.info("[upload-tmp-file] tmp upload ok", {
      key: s3ObjectKey,
      size: file.size,
      contentType,
      userId: request.headers.get("x-user-id"),
    });

    return NextResponse.json({ url: permanentUrl }, { status: 200 });
  } catch (error: any) {
    logger.error("[upload-tmp-file] Error al subir imagen temporal", {
      message: error?.message,
      awsCode: error?.Code,
      awsName: error?.name,
      userId: request.headers.get("x-user-id"),
    });
    return NextResponse.json(
      { mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
