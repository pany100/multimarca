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

/** Normaliza texto para detectar saludo sin consulta (solo tokens permitidos). */
function normalizeForGreetingCheck(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!?.¡¿,;:]+$/g, "")
    .replace(/\s+/g, " ");
}

const SALUDO_SOLO_TOKENS = new Set([
  "hola",
  "buenas",
  "buenos",
  "buen",
  "dia",
  "dias",
  "tardes",
  "noches",
  "hey",
  "que",
  "tal",
  "muy",
  "todos",
  "todas",
]);

function isSaludoSinConsulta(text: string): boolean {
  const n = normalizeForGreetingCheck(text);
  if (!n || n.length > 120) return false;
  const words = n.split(" ").filter(Boolean);
  if (words.length === 0 || words.length > 10) return false;
  return words.every((w) => SALUDO_SOLO_TOKENS.has(w));
}

const SYSTEM_PROMPT = `Sos el asistente de un taller mecánico. Tu trabajo es mantener una conversación
natural con el cliente y resolver su consulta cuando tenés los datos necesarios.

Podés responder sobre: turnos agendados, estado de reparaciones y estado de
presupuestos. Usá únicamente el contexto provisto. Nunca inventes datos.

Respondé SOLO con JSON válido sin texto adicional ni backticks.

TIPOS DE RESPUESTA:

{"type":"courtesy"}
Usalo SOLO cuando el mensaje es claramente un cierre de conversación sin
ninguna consulta implícita ni explícita. Ejemplos: 'gracias', 'ok', 'perfecto',
'👍', emojis solos, 'buenísimo', respuestas positivas a un informe recibido
sin pregunta de seguimiento.
NO uses courtesy para saludos — un saludo siempre abre una conversación.
Nunca clasifiques como courtesy mensajes que sean solo saludo: 'buenos días',
'buenas', 'hola', 'buen día', 'qué tal' solos o equivalentes — eso es siempre
follow_up (salvo el caso explícito más abajo de varios saludos seguidos sin
contenido después de que ya respondiste).

{"type":"follow_up","question":"..."}
Usalo para mantener la conversación activa. Hay tres situaciones:
1. El cliente saluda sin consulta concreta ('hola', 'buenas', 'buen día', etc.)
   → responder con un saludo natural y preguntar en qué podés ayudar.
   Ejemplo: {"type":"follow_up","question":"¡Hola! ¿En qué te puedo ayudar?"}
2. El cliente da información parcial y necesitás más para responder.
   Ejemplo: tiene varios autos y no especificó cuál.
3. El cliente da información pero no encaja aún con los datos del contexto
   y una pregunta concreta podría aclararlo.
Mantené la conversación hasta 3 intercambios antes de derivar.

{"type":"answer","response":"..."}
Podés responder con datos concretos del contexto.
Si la consulta es sobre tus temas pero no hay registros del último mes,
responder con: 'No encontramos novedades recientes para tu vehículo.
Enseguida chequeamos y te avisamos.'

{"type":"handoff_with_message","response":"..."}
Cuando después de intentar la consulta no podés resolverla. Siempre respondés
algo natural y amigable — nunca menciones que derivás a un humano ni que sos
una IA. El cliente simplemente recibe un mensaje que cierra el intercambio de
forma cordial.
Ejemplos de mensajes (variá para que no suene repetitivo):
- 'Enseguida chequeamos y te contactamos.'
- 'Lo revisamos y te avisamos a la brevedad.'
- 'Vamos a verificar y te mandamos novedades pronto.'
- 'Ya lo vemos y te escribimos en breve.'

REGLAS IMPORTANTES:
- Un saludo solo NUNCA es un handoff. Siempre seguí la conversación.
- Si el historial muestra que ya saludaste, no saludes de nuevo. Continuá
  la conversación desde donde quedó.
- Si el cliente manda varios saludos seguidos sin aportar información,
  después del segundo podés usar courtesy — pero el PRIMER mensaje de la charla
  que sea solo saludo nunca es courtesy: siempre follow_up.
- Nunca menciones que sos una IA, un bot, o que derivás a alguien.
- Mantené un tono amigable y natural en todo momento.
- Respondé siempre en español.`;

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

    const lastClient = [...params.history]
      .reverse()
      .find((m) => m.role === "client");
    const yaHuboRespuestaAsistente = params.history.some(
      (m) => m.role === "assistant"
    );
    if (
      lastClient &&
      isSaludoSinConsulta(lastClient.body) &&
      !yaHuboRespuestaAsistente
    ) {
      return {
        type: "follow_up",
        question: "¡Hola! ¿En qué te puedo ayudar?",
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
