// apps/web/src/shared/utils/pagination.ts
export type PageRequest = {
  page?: number | string | null;
  size?: number | string | null;
  query?: string | null;
};

export type DateFilters =
  | { month?: number | string | null; year?: number | string | null } // p/ month-year
  | { from?: string | null; to?: string | null }; // p/ rango libre

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

export function normalizePageSize(
  pageRaw?: number | string | null,
  sizeRaw?: number | string | null,
  opt: { defaultPage?: number; defaultSize?: number; maxSize?: number } = {}
) {
  const defaultPage = opt.defaultPage ?? 0;
  const defaultSize = opt.defaultSize ?? 50;
  const maxSize = opt.maxSize ?? 200;

  let page = Number(pageRaw ?? defaultPage);
  let size = Number(sizeRaw ?? defaultSize);

  if (!Number.isFinite(page) || page < 1) page = defaultPage;
  if (!Number.isFinite(size) || size < 1) size = defaultSize;
  if (size > maxSize) size = maxSize;

  return { page, size };
}

export function getSkipTake(page: number, size: number) {
  return { skip: page * size, take: size };
}

export function monthYearToRange(
  month?: number | string | null,
  year?: number | string | null
) {
  if (!month || !year) return undefined;
  const m = Number(month);
  const y = Number(year);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return undefined;
  // [start, end] del mes completo
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

export function rangeFromStrings(from?: string | null, to?: string | null) {
  if (!from && !to) return undefined;
  const start = from ? new Date(from) : undefined;
  const end = to ? new Date(to) : undefined;
  if (start && Number.isNaN(start.getTime()))
    throw new Error("Fecha 'from' inválida");
  if (end && Number.isNaN(end.getTime()))
    throw new Error("Fecha 'to' inválida");
  return { start, end };
}

export function buildPageResult<T>(
  items: T[],
  total: number,
  page: number,
  size: number
): PageResult<T> {
  return { items, total, page, size, totalPages: Math.ceil(total / size) };
}

/**
 * Helper genérico para Prisma:
 *   prismaPaged(prisma.recordatorioAgenda, { where, orderBy }, page, size)
 */
export async function prismaPaged<T>(
  model: { findMany: Function; count: Function },
  args: { where?: any; orderBy?: any; include?: any; select?: any },
  page: number,
  size: number
): Promise<PageResult<T>> {
  const { skip, take } = getSkipTake(page, size);
  const [items, total] = await Promise.all([
    model.findMany({ ...args, skip, take }),
    model.count({ where: args.where }),
  ]);
  return buildPageResult(items as T[], total as number, page, size);
}
