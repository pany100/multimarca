// src/core/application/services/recibo.service.ts
import { PdfGeneratorPort } from "@/core/domain/ports/pdf-generator.port";
import { IngresoPorReparacionWithRelations } from "@/core/infrastructure/database/repositories/prisma-ingreso-reparacion.repository";
import { ReciboHtmlTemplate } from "../templates/recibos/recibo-html.template";

export class ReciboService {
  constructor(private readonly pdf: PdfGeneratorPort) {}

  async generarReciboPdf(
    ingreso: IngresoPorReparacionWithRelations
  ): Promise<Buffer> {
    const reciboTemplate = new ReciboHtmlTemplate();
    const html = reciboTemplate.generate(ingreso);
    return this.pdf.generate(html, {
      format: "letter",
    });
  }
}
