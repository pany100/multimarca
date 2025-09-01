import generateClientOrderHtml from "@/utils/generateClientOrderHtml";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { EstadoOrdenReparacion } from "@prisma/client";
import { PDFDocument, rgb } from "pdf-lib";
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
            controlMecanico: {
              include: {
                parent: true,
              },
            },
          },
        },
        ingresos: {
          include: {
            dolar: true,
          },
        },
        scannerFile: true,
        recibosFiles: true,
      },
    });

    if (!ordenReparacion) {
      return new Response(
        JSON.stringify({ error: "Orden de reparación no encontrada" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 1. Generar el PDF base usando puppeteer
    const basePdfBuffer = await generateBasePdf(ordenReparacion);

    // Inicializar el PDF final con el PDF base
    let finalPdfBuffer = basePdfBuffer;

    // 2. Verificar si hay un PDF adicional (scanner)
    if (ordenReparacion.scannerFile) {
      const scannerPdfBuffer = await getFileFromS3(
        ordenReparacion.scannerFile?.finalPath ||
          ordenReparacion.scannerFile?.tempPath
      );
      // Combinar el PDF base con el PDF del scanner
      finalPdfBuffer = await mergePdfs(finalPdfBuffer, scannerPdfBuffer);
    }

    // 3. Verificar si hay recibos para añadir
    if (
      ordenReparacion.recibosFiles &&
      Array.isArray(ordenReparacion.recibosFiles) &&
      ordenReparacion.recibosFiles.length > 0
    ) {
      // Generar un PDF con las imágenes de los recibos
      const recibosPdfBuffer = await generateRecibosPdf(
        ordenReparacion.recibosFiles.map(
          (r) => r.finalPath || r.tempPath
        ) as string[]
      );
      // Combinar el PDF actual con el PDF de recibos
      finalPdfBuffer = await mergePdfs(finalPdfBuffer, recibosPdfBuffer);
    }

    // 4. Devolver el PDF final como descarga
    return new Response(new Uint8Array(finalPdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orden-reparacion-completa-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF completo:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el PDF completo" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
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
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="margin: 0 25px; padding: 0 20px; width: 100%; font-family: Arial, sans-serif;">
        <div style="border-top: 1px solid black; width: 100%;"></div>
        <div style="text-align: left; font-size: 12px; margin-top: 8px;">
          ${
            repair.estado === EstadoOrdenReparacion.Presupuestado ||
            repair.estado === EstadoOrdenReparacion.Aceptado
              ? "Detalle de presupuesto solicitado, valores al día, sujeto a desarme"
              : "Detalle del trabajo"
          }
        </div>
      </div>
    `,
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

// Función para generar un PDF con las imágenes de los recibos
async function generateRecibosPdf(recibos: string[]): Promise<Buffer> {
  try {
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Añadir una página de título para los recibos
    const titlePage = pdfDoc.addPage();
    const { width, height } = titlePage.getSize();

    // Añadir título a la página
    titlePage.drawText("RECIBOS", {
      x: 50,
      y: height - 100,
      size: 30,
      color: rgb(0, 0, 0),
    });

    // Añadir subtítulo
    titlePage.drawText(
      "Imágenes de recibos adjuntos a la orden de reparación",
      {
        x: 50,
        y: height - 150,
        size: 14,
        color: rgb(0.3, 0.3, 0.3),
      }
    );

    // Variable para controlar si ya se mostró la primera imagen en la página de título
    let firstImageShown = false;

    // Procesar cada recibo
    for (const reciboUrl of recibos) {
      try {
        // Verificar si es una imagen (solo procesamos imágenes)
        if (isImageUrl(reciboUrl)) {
          // Obtener la imagen desde S3
          const imageBuffer = await getFileFromS3(reciboUrl);

          // Determinar el formato de la imagen
          let imageFormat;
          if (reciboUrl.toLowerCase().endsWith(".png")) {
            imageFormat = "png";
          } else if (
            reciboUrl.toLowerCase().endsWith(".jpg") ||
            reciboUrl.toLowerCase().endsWith(".jpeg")
          ) {
            imageFormat = "jpeg";
          } else {
            // Saltar si no es un formato de imagen soportado
            continue;
          }

          let image;
          if (imageFormat === "png") {
            image = await pdfDoc.embedPng(new Uint8Array(imageBuffer));
          } else {
            image = await pdfDoc.embedJpg(new Uint8Array(imageBuffer));
          }

          // Calcular dimensiones para mantener la proporción
          const imgWidth = image.width;
          const imgHeight = image.height;

          // Decidir en qué página dibujar la imagen y qué tamaño usar
          let page;
          let yPosition;
          let drawWidth, drawHeight;

          if (!firstImageShown) {
            // Colocar la primera imagen en la página de título, debajo del subtítulo
            page = titlePage;

            // Hacer la primera imagen más pequeña (60% del ancho de la página)
            drawWidth = width * 0.6;
            drawHeight = (imgHeight / imgWidth) * drawWidth;

            // Ajustar si la altura es demasiado grande (40% de la altura de la página)
            if (drawHeight > height * 0.4) {
              drawHeight = height * 0.4;
              drawWidth = (imgWidth / imgHeight) * drawHeight;
            }

            // Posicionar debajo del subtítulo
            yPosition = height - 220 - drawHeight;
            firstImageShown = true;
          } else {
            // Crear una nueva página para las imágenes restantes
            page = pdfDoc.addPage();

            // Para las demás imágenes, usar el espacio completo disponible (90% del ancho)
            drawWidth = width * 0.9;
            drawHeight = (imgHeight / imgWidth) * drawWidth;

            // Ajustar si la altura es demasiado grande (90% de la altura de la página)
            if (drawHeight > height * 0.9) {
              drawHeight = height * 0.9;
              drawWidth = (imgWidth / imgHeight) * drawHeight;
            }

            // Centrar verticalmente
            yPosition = (height - drawHeight) / 2;
          }

          // Dibujar la imagen centrada horizontalmente
          page.drawImage(image, {
            x: (width - drawWidth) / 2,
            y: yPosition,
            width: drawWidth,
            height: drawHeight,
          });
        }
      } catch (error) {
        console.error(`Error procesando recibo ${reciboUrl}:`, error);
        // Continuar con el siguiente recibo si hay un error
        continue;
      }
    }

    // Guardar el documento como buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error generando PDF de recibos:", error);
    throw error;
  }
}

// Función para determinar si una URL es una imagen
function isImageUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".jpg") ||
    lowerUrl.endsWith(".jpeg") ||
    lowerUrl.endsWith(".png")
  );
}
