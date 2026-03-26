import Anthropic, { APIError } from "@anthropic-ai/sdk";

export type AiFilterResult =
  | { type: "answer"; response: string }
  | { type: "follow_up"; question: string }
  | { type: "courtesy" }
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

/** Quitar cercas ```json … ``` y, si hace falta, el primer objeto JSON `{…}`. */
function coerceAssistantJsonText(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
  }
  if (!s.startsWith("{")) {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      s = s.slice(start, end + 1);
    }
  }
  return s.trim();
}

const SYSTEM_PROMPT = `Sos el asistente de un taller mecánico. Tu trabajo es clasificar mensajes
entrantes de clientes y responder cuando tenés los datos necesarios.

Podés responder sobre: turnos agendados, estado de reparaciones y estado
de presupuestos. Usá únicamente el contexto provisto. Nunca inventes datos.

Respondé SOLO con JSON válido sin texto adicional ni backticks.

Tipos de respuesta posibles:

{\"type\":\"courtesy\"}
Usá esto cuando el mensaje del cliente es claramente un cierre de conversación
o acuse de recibo que no requiere respuesta ni acción. Ejemplos: 'gracias',
'ok', 'perfecto', 'dale', 'entendido', 'buenísimo', '👍', '🙏', emojis solos,
mensajes muy cortos sin pregunta implícita. También usalo cuando el cliente
responde a un PDF o informe que el taller acaba de enviar con un comentario
positivo o neutro que no contiene ninguna consulta.

{\"type\":\"answer\",\"response\":\"...\"}
Usá esto cuando podés responder la consulta con los datos del contexto.
Si los arrays de órdenes y presupuestos están vacíos o no tienen registros
del último mes, respondé con:
'No encontramos registros recientes para tu vehículo. Un administrativo
del taller se va a contactar con vos a la brevedad.'

{\"type\":\"follow_up\",\"question\":\"...\"}
Usá esto SOLO cuando una pregunta concreta al cliente te permitiría resolver
su consulta. Por ejemplo si tiene varios autos y no sabés a cuál se refiere.
Limitá los follow_up: si ya hiciste una pregunta y el cliente respondió
pero igual no podés resolver, usá handoff.

{\"type\":\"handoff\"}
Usá esto cuando la consulta es sobre un tema que no podés resolver (precios,
horarios, garantías, reclamos, etc.) o cuando después de un follow_up
sigues sin poder responder.

Reglas adicionales:
- No menciones que sos una IA ni que consultás una base de datos.
- No respondas a mensajes de cortesía con más cortesía — usá courtesy.
- Si el historial muestra que el taller acaba de enviar un documento y el
cliente responde algo neutro o positivo sin hacer una pregunta, usá courtesy.
- Respondé siempre en español, de forma breve y amigable.`;

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

      const jsonText = coerceAssistantJsonText(text);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
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
        if (p.type === "courtesy") {
          return { type: "courtesy" };
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
