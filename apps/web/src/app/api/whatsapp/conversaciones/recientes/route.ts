import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { GetAllConversacionesUseCase } from "@/core/application/use-cases/whatsapp/get-all-conversaciones.use-case";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await new GetAllConversacionesUseCase(
      new WhatsAppService(new PrismaWhatsAppRepository())
    ).execute();

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

