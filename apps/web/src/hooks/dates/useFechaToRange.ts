import { useMemo } from "react";

/**
 * Hook to transform a month (1-12) and optional year into a date range.
 * - If year is omitted, it uses the current year.
 * - `from` is set to the first day of the month at 00:00:00.000
 * - `to` is set to the last day of the month at 23:59:59.999
 */
function useFechaToRange(
  mes: number | string | undefined | null,
  anio?: number | string | undefined | null
): { from: Date | undefined; to: Date | undefined } {
  const range = useMemo(() => {
    if (mes === undefined || mes === null || mes === "") {
      // When month is not provided, return undefineds to avoid errors in consumers
      return { from: undefined, to: undefined };
    }

    const monthNumber = typeof mes === "string" ? parseInt(mes, 10) : mes;
    if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      throw new Error("useFechaToRange: 'mes' debe estar entre 1 y 12");
    }

    const currentYear = new Date().getFullYear();
    const yearNumber =
      anio === undefined || anio === null || anio === ""
        ? currentYear
        : typeof anio === "string"
        ? parseInt(anio, 10)
        : anio;

    if (Number.isNaN(yearNumber)) {
      throw new Error("useFechaToRange: 'anio' inválido");
    }

    const monthIndex = monthNumber - 1; // JS Date uses 0-11 for months

    const from = new Date(yearNumber, monthIndex, 1, 0, 0, 0, 0);
    // Last day of month: day 0 of next month
    const to = new Date(yearNumber, monthIndex + 1, 0, 23, 59, 59, 999);

    return { from, to };
  }, [mes, anio]);

  return range;
}

export default useFechaToRange;
