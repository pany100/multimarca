/**
 * Puerto para consultar si una fecha es feriado.
 */
export interface FeriadoRepository {
  existsByFecha(fecha: Date): Promise<boolean>;
}
