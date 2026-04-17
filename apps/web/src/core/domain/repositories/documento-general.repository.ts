import {
  CreateDocumentoGeneralData,
  ListDocumentoGeneralQuery,
  UpdateDocumentoGeneralData,
} from "@/core/infrastructure/validation/schemas/documento-general.schema";
import { CustomFile, DocumentoGeneral } from "@prisma/client";

export type DocumentoGeneralWithArchivo = DocumentoGeneral & {
  archivo: CustomFile | null;
};

export interface ListDocumentoGeneralResult {
  items: DocumentoGeneralWithArchivo[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface DocumentoGeneralRepository {
  list(query: ListDocumentoGeneralQuery): Promise<ListDocumentoGeneralResult>;
  findById(id: number): Promise<DocumentoGeneralWithArchivo | null>;
  create(data: CreateDocumentoGeneralData): Promise<DocumentoGeneral>;
  update(data: UpdateDocumentoGeneralData): Promise<DocumentoGeneral>;
  delete(id: number): Promise<DocumentoGeneral>;
}
