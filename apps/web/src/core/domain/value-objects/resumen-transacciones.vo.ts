import { DateRangeVO } from "./date-range.vo";

export class ResumenTransaccionesVO {
  constructor(
    public readonly page: number,
    public readonly size: number,
    public readonly query: string,
    public readonly tipoOperacionId: number | undefined,
    public readonly dateRange: DateRangeVO
  ) {}
}
