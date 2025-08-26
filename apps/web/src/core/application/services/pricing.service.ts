import type {
  PricingInput,
  PricingPort,
} from "@/core/domain/ports/pricing.port";

export class DefaultPricingService implements PricingPort {
  normalize(input: PricingInput): Required<PricingInput> {
    const safe = (n?: number) => (typeof n === "number" ? n : 0);
    return {
      descuento: safe(input.descuento),
      incremento: safe(input.incremento),
      incrementoInterno: safe(input.incrementoInterno),
      porcentajeRecargo: safe(input.porcentajeRecargo),
    };
  }
}
