import { CustomFile, EstadoArchivo } from "@prisma/client";

export type CustomFileInput = Omit<CustomFile, "id">;

export type CustomFileUpdateInput = {
  id: number;
  status: EstadoArchivo;
  ordenReparacionId?: number | null;
  reciboORepId?: number | null;
  reparacionDeTerceroId?: number | null;
};

export interface CustomFileRepository {
  create(file: CustomFileInput): Promise<CustomFile>;
  update(file: CustomFileUpdateInput, deps?: { tx?: any }): Promise<CustomFile>;
}
