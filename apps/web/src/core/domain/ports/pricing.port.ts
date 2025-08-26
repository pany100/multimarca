export type PricingInput = {
  descuento?: number; // %
  incremento?: number; // %
  incrementoInterno?: number; // %
  porcentajeRecargo?: number; // %
};

export interface PricingPort {
  normalize(input: PricingInput): Required<PricingInput>;
}
