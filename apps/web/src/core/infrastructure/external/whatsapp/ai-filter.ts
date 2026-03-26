import Anthropic, { APIError } from "@anthropic-ai/sdk";

export type AiFilterResult =
  | { type: "answer"; response: string }
  | { type: "follow_up"; question: string }
  | { type: "handoff" };

export type ConversationMessage = {
  role: "client" | "assistant";
  body: string;
};

export type AiFilterContext = {
  turnosFuturos: { fecha: Date; hora: string; problema: string; auto: string }[];
  ultimasOrdenes: { id: number; estado: string; auto: string }[];
  ultimosPresupuestos: { id: number; estado: string; auto: string }[];
};

let circuitOpen = false;
let consecutiveErrors = 0;
let circuitOpenedAt: Date | null = null;

const THRESHOLD =
  parseInt(process.env.AI_CIRCUIT_BREAKER_THRESHOLD ?? "3", 10) || 3;
const RESET_MS =
  (parseInt(process.env.AI_CIRCUIT_BREAKER_RESET_MINUTES ?? "30", 10) ||
    30) *
  60 *
  1000;

function checkAndResetCircuit(): boolean {
  if (!circuitOpen) return false;
  if (circuitOpenedAt && Date.now() - circuitOpenedAt.getTime() > RESET_MS) {
    circuitOpen = false;
    consecutiveErrors = 0;
    circuitOpenedAt = null;
    console.log("[AI Filter] Circuit breaker reseteado");
    return false;
  }
  return true;
}

function recordError(isLimitError: boolean) {
  if (!isLimitError) return;
  consecutiveErrors++;
  if (consecutiveErrors >= THRESHOLD) {
    circuitOpen = true;
    circuitOpenedAt = new Date();
    console.error(
      `[AI Filter] Circuit breaker ABIERTO por ${process.env.AI_CIRCUIT_BREAKER_RESET_MINUTES ?? "30"} minutos`
    );
  }
}

function recordSuccess() {
  consecutiveErrors = 0;
}

const SYSTEM_PROMPT = `Sos el asistente de un taller mecánico. Podés responder sobre:
turnos agendados, estado de reparaciones y estado de presupuestos.
Usá únicamente el contexto provisto. Nunca inventes datos.
Respondé SOLO con JSON válido sin texto adicional ni backticks.

Formatos posibles:
- Si podés responder: {"type":"answer","response":"...mensaje en español, breve y amigable..."}
- Si necesitás más información del cliente para responder: {"type":"follow_up","question":"...pregunta concreta..."}
- Si la consulta está fuera de tus temas o no podés resolverla: {"type":"handoff"}

Usá follow_up SOLO cuando una pregunta adicional te permitiría resolver la consulta.
Limitá los follow_up: si ya hiciste una pregunta y el cliente respondió pero igual no podés resolver, respondé handoff.
Respondé siempre en español.`;

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

export class WhatsAppAiFilter {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    this.client ??= new Anthropic();
    return this.client;
  }

  async classify(params: {
    history: ConversationMessage[];
    cliente: { fullName: string };
    context: AiFilterContext;
  }): Promise<AiFilterResult> {
    if (checkAndResetCircuit()) {
      return { type: "handoff" };
    }

    try {
      const userMessage = JSON.stringify({
        historial: params.history.map((m) => ({
          rol: m.role,
          mensaje: m.body,
        })),
        cliente: params.cliente.fullName,
        contexto: params.context,
      });

      const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

      const response = await this.getClient().messages.create({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const block = response.content[0];
      const text =
        block?.type === "text" ? block.text.trim() : "";

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error("[AI Filter] Respuesta no es JSON válido:", text);
        return { type: "handoff" };
      }

      recordSuccess();

      if (
        parsed &&
        typeof parsed === "object" &&
        parsed !== null &&
        "type" in parsed
      ) {
        const p = parsed as Record<string, unknown>;
        if (
          p.type === "answer" &&
          typeof p.response === "string" &&
          p.response.length > 0
        ) {
          return { type: "answer", response: p.response };
        }
        if (
          p.type === "follow_up" &&
          typeof p.question === "string" &&
          p.question.length > 0
        ) {
          return { type: "follow_up", question: p.question };
        }
      }

      return { type: "handoff" };
    } catch (err: unknown) {
      const status = err instanceof APIError ? err.status : undefined;
      const isLimitError = status === 429 || status === 402;
      recordError(isLimitError);
      console.error(
        "[AI Filter] Error:",
        err instanceof Error ? err.message : err
      );
      return { type: "handoff" };
    }
  }
}

export const aiFilter = new WhatsAppAiFilter();
