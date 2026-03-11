import {
  CreateManoDeObraData,
  ListManoDeObraQuery,
  UpdateManoDeObraData,
} from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { ManoDeObra } from "@prisma/client";

export interface ListManoDeObraResult {
  items: ManoDeObra[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ManoDeObraRepository {
  list(query: ListManoDeObraQuery): Promise<ListManoDeObraResult>;
  findById(id: number): Promise<ManoDeObra | null>;
  create(data: CreateManoDeObraData): Promise<ManoDeObra>;
  update(data: UpdateManoDeObraData): Promise<ManoDeObra>;
  delete(id: number): Promise<ManoDeObra>;
  exportAll(): Promise<ManoDeObra[]>;
  updateAllPrecios(
    type: "aumento" | "descuento",
    porcentaje: number
  ): Promise<number>;
}
