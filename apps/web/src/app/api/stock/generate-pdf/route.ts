import { format } from "date-fns";
import { GenerateStockPdfUseCase } from "@/core/application/use-cases/stock/generate-stock-pdf.use-case";
import { generateStockPdfSchema } from "@/core/infrastructure/validation/schemas/stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, generateStockPdfSchema);
    const pdfBuffer = await new GenerateStockPdfUseCase().execute(dto);

    // Return the PDF as a response - convert Buffer to Uint8Array for compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Stock_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
