export class DateRangeVO {
  public readonly from: string | undefined;
  public readonly to: string | undefined;

  constructor(from: string | null | undefined, to: string | null | undefined) {
    this.from = this.parseDate(from);
    this.to = this.parseDate(to);
  }

  private parseDate(dateStr: string | null | undefined): string | undefined {
    if (!dateStr || dateStr === "") return undefined;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  toMandatoryDate() {
    const from = this.from ?? "1900-01-01 00:00:00.000";
    const to = this.to ?? new Date().toISOString();
    return { from: new Date(from), to: new Date(to) };
  }
}
