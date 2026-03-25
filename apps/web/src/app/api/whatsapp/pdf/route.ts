import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { SendPdfUseCase } from "@/core/application/use-cases/whatsapp/send-pdf.use-case";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
import { sendPdfSchema } from "@/core/infrastructure/validation/schemas/whatsapp.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const dto = await validateRequest(body, sendPdfSchema);

    await new SendPdfUseCase(
      new WhatsAppService(new PrismaWhatsAppRepository())
    ).execute(dto);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

