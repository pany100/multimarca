import { PaperFormat } from "puppeteer";

export interface PdfGeneratorPort {
  generate(
    html: string,
    options?: {
      format?: PaperFormat;
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
    }
  ): Promise<Buffer>;
}
