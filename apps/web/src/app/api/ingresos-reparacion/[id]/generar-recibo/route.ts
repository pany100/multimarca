import { ReciboService } from "@/core/application/services/recibo.service";
import { GenerateReciboUseCase } from "@/core/application/use-cases/ingreso-reparacion/generate-recibo.use-case";
import { PuppeteerPdfGenerator } from "@/core/infrastructure/external/puppeteer-pdf-generator";
import { generateReciboQuerySchema } from "@/core/infrastructure/validation/schemas/ingreso-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const generateReciboDto = await validateRequest(
      { id },
      generateReciboQuerySchema
    );
    const generateReciboUseCase = new GenerateReciboUseCase(
      new ReciboService(new PuppeteerPdfGenerator())
    );
    const pdfBuffer = await generateReciboUseCase.execute(generateReciboDto.id);

    // Convert Buffer to Uint8Array which is compatible with Response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo_${id}.pdf"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
