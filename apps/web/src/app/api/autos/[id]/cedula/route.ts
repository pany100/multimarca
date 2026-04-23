import logger from "@/lib/logger";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { EstadoArchivo, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const allowedExtensions = ["jpg", "jpeg", "png"];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  try {
    const carId = parseInt(params.id);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { mensaje: "No se proporcionó ningún archivo" },
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

    const s3Client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3ObjectKey,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      })
    );

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_DEFAULT_REGION!;
    const tmpUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3ObjectKey}`;
    assertTempPathInTmp(tmpUrl);

    const existingFile = await prisma.customFile.findUnique({
      where: { autoCedulaVerdeId: carId },
      select: { id: true },
    });
    if (existingFile) {
      await prisma.customFile.update({
        where: { id: existingFile.id },
        data: {
          autoCedulaVerdeId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }

    await prisma.customFile.create({
      data: {
        tempPath: tmpUrl,
        autoCedulaVerdeId: carId,
      },
    });

    const updatedCar = await prisma.auto.findUnique({
      where: { id: carId },
      include: { owner: true, cedulaVerdeFile: true },
    });

    logger.info("[autos/cedula] upload ok", {
      carId,
      customFileTempPath: tmpUrl,
      userId: request.headers.get("x-user-id"),
    });

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error: any) {
    logger.error("[autos/cedula] Error al agregar cédula verde", {
      message: error?.message,
      awsCode: error?.Code,
      awsName: error?.name,
    });
    return NextResponse.json(
      { mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
