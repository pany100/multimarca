import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { GetConversacionesUseCase } from "@/core/application/use-cases/whatsapp/get-conversaciones.use-case";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
import { listConversacionesSchema } from "@/core/infrastructure/validation/schemas/whatsapp.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      { clienteId: searchParams.get("clienteId") },
      listConversacionesSchema
    );

    const data = await new GetConversacionesUseCase(
      new WhatsAppService(new PrismaWhatsAppRepository())
    ).execute({ clienteId: dto.clienteId });

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

