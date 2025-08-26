import type { ExchangeRatePort } from "@/core/domain/ports/exchange-rate.port";
import getDolarForDate from "@/utils/dolar";

export class DolarExchangeAdapter implements ExchangeRatePort {
  getForDate(date: Date) {
    return getDolarForDate(date);
  }
}
