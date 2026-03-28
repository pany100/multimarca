import Anthropic, { APIError } from "@anthropic-ai/sdk";

export type AiFilterResult =
  | { type: "answer"; response: string }
  | { type: "follow_up"; question: string }
  | { type: "courtesy" }
  | { type: "handoff_with_message"; response: string };

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

const SYSTEM_PROMPT = `Sos el asistente de un taller mecánico. Tu trabajo es clasificar y responder
mensajes entrantes de clientes.

Podés responder sobre: turnos agendados, estado de reparaciones y estado
de presupuestos. Usá únicamente el contexto provisto. Nunca inventes datos.

Respondé SOLO con JSON válido sin texto adicional ni backticks.

TIPOS DE RESPUESTA:

{"type":"courtesy"}
Mensajes que son claramente cierre de conversación o acuse de recibo sin
consulta implícita. Ejemplos: 'gracias', 'ok', 'perfecto', 'dale', '👍',
emojis solos, respuestas positivas a un informe enviado sin pregunta.

{"type":"follow_up","question":"..."}
Usalo en DOS situaciones:
1. El cliente saluda o abre la conversación sin hacer una consulta concreta
   ('hola', 'buenas', 'buen día', 'hola cómo están', etc.).
   En ese caso responder con un saludo + preguntar en qué podés ayudar.
   Ejemplo: {"type":"follow_up","question":"¡Hola! ¿En qué te podemos ayudar hoy?"}
2. El cliente hace una consulta sobre tus temas pero necesitás más información
   para responder (ej: tiene varios autos y no sabés a cuál se refiere).
Limitá los follow_up: si ya hiciste una pregunta y el cliente respondió
pero igual no podés resolver, usá handoff_with_message.

{"type":"answer","response":"..."}
Podés responder con datos concretos del contexto.
Si la consulta es sobre tus temas pero los arrays están vacíos o no tienen
registros del último mes, responder con:
'No encontramos registros recientes para tu vehículo. Un administrativo
del taller se va a contactar con vos a la brevedad.'

{"type":"handoff_with_message","response":"..."}
La consulta está fuera de tus temas o no podés resolverla, pero SIEMPRE
respondés algo amigable antes de derivar. Nunca dejes al cliente sin respuesta.
Ejemplos de respuesta:
- 'Enseguida te comunico con un asesor del taller que puede ayudarte mejor.'
- 'Esa consulta la vamos a derivar con alguien del equipo. Te contactamos a la brevedad.'
- 'Para eso mejor te atiendo un asesor directamente. ¡Ya te contactamos!'
Variá el mensaje para que no suene siempre igual.

REGLAS:
- Nunca uses handoff sin mensaje. Siempre usá handoff_with_message.
- Saludos sin consulta → follow_up con saludo amigable, nunca handoff.
- No menciones que sos una IA ni que consultás una base de datos.
- Respondé siempre en español, de forma breve y amigable.
- Si el historial muestra que ya saludaste al cliente y el cliente sigue
  mandando saludos sin hacer una consulta concreta, respondé con courtesy.
  No repitas el saludo más de una vez.
- Si el cliente lleva más de 2 mensajes sin dar información útil después
  de que preguntaste en qué podés ayudar, usá handoff_with_message.`;

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
      return {
        type: "handoff_with_message",
        response: "Enseguida te comunico con un asesor del taller.",
      };
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
      let raw: unknown;
      try {
        raw = JSON.parse(jsonText);
      } catch {
        console.error("[AI Filter] Respuesta no es JSON válido:", text);
        return {
          type: "handoff_with_message",
          response: "Enseguida te comunico con un asesor del taller.",
        };
      }

      recordSuccess();

      if (typeof raw !== "object" || raw === null) {
        return {
          type: "handoff_with_message",
          response: "Enseguida te comunico con un asesor del taller.",
        };
      }

      const parsed = raw as Record<string, unknown>;

      if (
        parsed.type === "answer" &&
        typeof parsed.response === "string" &&
        parsed.response.length > 0
      )
        return { type: "answer", response: parsed.response };

      if (
        parsed.type === "follow_up" &&
        typeof parsed.question === "string" &&
        parsed.question.length > 0
      )
        return { type: "follow_up", question: parsed.question };

      if (parsed.type === "courtesy") return { type: "courtesy" };

      if (
        parsed.type === "handoff_with_message" &&
        typeof parsed.response === "string" &&
        parsed.response.length > 0
      )
        return { type: "handoff_with_message", response: parsed.response };

      // Fallback: si la IA devuelve algo inesperado, tratar como handoff con mensaje genérico
      return {
        type: "handoff_with_message",
        response: "Enseguida te comunico con un asesor del taller.",
      };
    } catch (err: unknown) {
      const status = err instanceof APIError ? err.status : undefined;
      const isLimitError = status === 429 || status === 402;
      recordError(isLimitError);
      console.error(
        "[AI Filter] Error:",
        err instanceof Error ? err.message : err
      );
      return {
        type: "handoff_with_message",
        response: "Enseguida te comunico con un asesor del taller.",
      };
    }
  }
}

export const aiFilter = new WhatsAppAiFilter();
