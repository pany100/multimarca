import generateClientOrderHtml from "@/utils/generateClientOrderHtml";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ordenReparacion = await prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: true,
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        revisadoPor: true,
        trabajosRealizados: true,
        controlesEnReparacion: {
          include: {
            controlMecanico: true,
          },
        },
        ingresos: true,
      },
    });

    if (!ordenReparacion) {
      return NextResponse.json(
        { error: "Orden de reparación no encontrada" },
        { status: 404 }
      );
    }

    // 1. Generar el PDF base usando puppeteer
    const basePdfBuffer = await generateBasePdf(ordenReparacion);

    // 2. Verificar si hay un PDF adicional
    if (!ordenReparacion.pdfPath) {
      // Si no hay PDF adicional, devolver solo el PDF base
      return new NextResponse(basePdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="orden-reparacion-${id}.pdf"`,
        },
      });
    }

    // 3. Obtener el PDF adicional desde S3
    const additionalPdfBuffer = await getFileFromS3(ordenReparacion.pdfPath);

    // 4. Combinar ambos PDFs
    const mergedPdfBuffer = await mergePdfs(basePdfBuffer, additionalPdfBuffer);

    // 5. Devolver el PDF combinado como descarga
    return new NextResponse(mergedPdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orden-reparacion-completa-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF completo:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF completo" },
      { status: 500 }
    );
  }
}

async function generateBasePdf(repair: any): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = generateClientOrderHtml(repair);
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function getFileFromS3(fileUrl: string): Promise<Buffer> {
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

    // Obtener el archivo de S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convertir el stream a buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;

    return new Promise<Buffer>((resolve, reject) => {
      stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  } catch (error) {
    console.error("Error obteniendo archivo de S3:", error);
    throw error;
  }
}

async function mergePdfs(
  pdf1Buffer: Buffer,
  pdf2Buffer: Buffer
): Promise<Buffer> {
  try {
    // Cargar los documentos PDF
    const pdf1Doc = await PDFDocument.load(new Uint8Array(pdf1Buffer));
    const pdf2Doc = await PDFDocument.load(new Uint8Array(pdf2Buffer));

    // Crear un nuevo documento PDF
    const mergedPdf = await PDFDocument.create();

    // Copiar las páginas del primer PDF
    const pdf1Pages = await mergedPdf.copyPages(
      pdf1Doc,
      pdf1Doc.getPageIndices()
    );
    for (const page of pdf1Pages) {
      mergedPdf.addPage(page);
    }

    // Copiar las páginas del segundo PDF
    const pdf2Pages = await mergedPdf.copyPages(
      pdf2Doc,
      pdf2Doc.getPageIndices()
    );
    for (const page of pdf2Pages) {
      mergedPdf.addPage(page);
    }

    // Guardar el documento combinado como buffer
    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);
  } catch (error) {
    console.error("Error al combinar PDFs:", error);
    throw error;
  }
}
