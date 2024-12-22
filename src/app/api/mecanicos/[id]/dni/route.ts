import { deleteFileFromS3 } from "@/utils/s3Helper";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const extensionesPermitidas = ["jpg", "jpeg", "png"];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const empleadoId = parseInt(params.id);
    const formData = await request.formData();
    const archivo = formData.get("file") as File | null;

    if (!archivo) {
      return NextResponse.json(
        { mensaje: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    const nombreArchivo = archivo.name;
    const extensionArchivo = nombreArchivo.split(".").pop()?.toLowerCase();

    if (
      !extensionArchivo ||
      !extensionesPermitidas.includes(extensionArchivo)
    ) {
      return NextResponse.json(
        { mensaje: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    const nombreArchivoSeguro = `${uuidv4()}.${extensionArchivo}`;
    const claveObjetoS3 = `dni-empleados/${nombreArchivoSeguro}`;

    const parametrosSubida = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: claveObjetoS3,
      Body: Buffer.from(await archivo.arrayBuffer()),
      ContentType: archivo.type,
    };

    const comando = new PutObjectCommand(parametrosSubida);
    await s3Client.send(comando);

    const nombreBucket = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_DEFAULT_REGION!;
    const urlPermanente = `https://${nombreBucket}.s3.${region}.amazonaws.com/${claveObjetoS3}`;
    // Obtener el empleado actual y su dniImagePath
    const empleadoActual = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { dniImagePath: true },
    });

    // Si existe una imagen previa, eliminarla de S3
    if (empleadoActual?.dniImagePath) {
      await deleteFileFromS3(empleadoActual.dniImagePath);
    }

    const empleadoActualizado = await prisma.empleado.update({
      where: { id: empleadoId },
      data: { dniImagePath: urlPermanente },
    });

    return NextResponse.json(empleadoActualizado, { status: 200 });
  } catch (error) {
    console.error("Error al agregar imagen del DNI:", error);
    return NextResponse.json(
      { mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
