import { PdfGeneratorPort } from "@/core/domain/ports/pdf-generator.port";
import puppeteer, { PaperFormat } from "puppeteer";

export class PuppeteerPdfGenerator implements PdfGeneratorPort {
  async generate(
    html: string,
    options?: {
      format?: PaperFormat;
      margin?: { top?: string; right?: string; bottom?: string; left?: string };
    }
  ): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      format: options?.format || "A4",
      printBackground: true,
      margin: options?.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();
    return pdf;
  }
}
