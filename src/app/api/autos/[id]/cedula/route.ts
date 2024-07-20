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

const allowedExtensions = ["jpg", "jpeg", "png"];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const s3ObjectKey = `cedula-verde/${secureFileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3ObjectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_DEFAULT_REGION!;
    const permanentUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3ObjectKey}`;

    const updatedCar = await prisma.auto.update({
      where: { id: carId },
      data: { cedulaVerdePath: permanentUrl },
      include: { owner: true },
    });

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error) {
    console.error("Error al agregar cédula verde:", error);
    return NextResponse.json(
      { mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
