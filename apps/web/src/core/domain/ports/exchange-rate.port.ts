export interface ExchangeRatePort {
  getForDate(date: Date): Promise<{ id: number } | null>;
}
