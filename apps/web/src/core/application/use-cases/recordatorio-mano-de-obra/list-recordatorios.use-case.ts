import type {
  ListRecordatoriosParams,
  ListRecordatoriosResult,
} from "@/core/application/services/recordatorio-mano-de-obra.service";
import { RecordatorioManoDeObraService } from "@/core/application/services/recordatorio-mano-de-obra.service";

export type ListRecordatoriosInput = ListRecordatoriosParams;
export type ListRecordatoriosOutput = ListRecordatoriosResult;

export class ListRecordatoriosUseCase {
  constructor(
    private readonly recordatorioService: RecordatorioManoDeObraService
  ) {}

  async execute(input: ListRecordatoriosInput): Promise<ListRecordatoriosOutput> {
    return this.recordatorioService.list(input);
  }
}
