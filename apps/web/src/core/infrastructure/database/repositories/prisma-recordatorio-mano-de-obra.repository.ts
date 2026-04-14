import type {
  RecordatorioManoDeObraRepository,
  TrabajoConRecordatorioRow,
} from "@/core/domain/repositories/recordatorio-mano-de-obra.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaRecordatorioManoDeObraRepository
  implements RecordatorioManoDeObraRepository
{
  async findTrabajosConRecordatorio(): Promise<TrabajoConRecordatorioRow[]> {
    const rows = await prisma.$queryRaw<TrabajoConRecordatorioRow[]>`
      SELECT 
        c.fullName, 
        c.phone, 
        orep.fechaSalidaReparacion,
        a.patent,
        orep.kilometros,
        tr.descripcion,
        tr.diasParaRecordatorio
      FROM
        OrdenReparacion orep
      JOIN
        Auto a on a.id = orep.autoId
      JOIN 
        Cliente c ON a.ownerId = c.id
      JOIN 
        TrabajoRealizado tr ON orep.id = tr.ordenReparacionId
      WHERE 
        orep.estado = 'Terminado'
      AND 
        c.can_receive_notifications = true
      AND
        tr.diasParaRecordatorio IS NOT NULL
      AND
        JSON_LENGTH(tr.diasParaRecordatorio) > 0
      AND NOT EXISTS (
        SELECT 1
        FROM OrdenReparacion newer
        JOIN TrabajoRealizado newer_tr ON newer_tr.ordenReparacionId = newer.id
        WHERE newer.autoId = orep.autoId
          AND newer.estado = 'Terminado'
          AND LOWER(TRIM(newer_tr.descripcion)) = LOWER(TRIM(tr.descripcion))
          AND newer.fechaSalidaReparacion > orep.fechaSalidaReparacion
      )
    `;
    return rows;
  }
}
