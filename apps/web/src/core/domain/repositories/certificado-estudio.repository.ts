import {
  CreateCertificadoEstudioData,
  ListCertificadoEstudioQuery,
  UpdateCertificadoEstudioData,
} from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";
import { CertificadoEstudio } from "@prisma/client";

export interface ListCertificadoEstudioResult {
  items: CertificadoEstudio[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CertificadoEstudioRepository {
  list(query: ListCertificadoEstudioQuery): Promise<ListCertificadoEstudioResult>;
  findById(id: number): Promise<CertificadoEstudio | null>;
  create(data: CreateCertificadoEstudioData): Promise<CertificadoEstudio>;
  update(data: UpdateCertificadoEstudioData): Promise<CertificadoEstudio>;
  delete(id: number): Promise<CertificadoEstudio>;
}
