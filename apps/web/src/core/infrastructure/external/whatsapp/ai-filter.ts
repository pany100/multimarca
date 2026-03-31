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
  turnosFuturos: { fecha: Date; hora: string; problema: string; auto: string }[]
  ultimasOrdenes: {
    id: number
    estado: string
    auto: string
    fechaCreacion: Date
    fechaSalidaReparacion: Date | null
    trabajosRealizados: string[]
  }[]
  ultimosPresupuestos: { id: number; estado: string; auto: string }[]
  trabajosRealizados: string[]
}

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
    .replace(/\u200b/g, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Puntuación en medio o al final ("hola!", "hola! hola") → separar o quitar
    .replace(/[!?.¡¿,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Saludo + vocativos breves (equipo, chicos, etc.) sin consulta. */
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
  "a",
  "chicos",
  "chicas",
  "equipo",
  "gente",
  "amigos",
  "amigas",
  "muchachos",
  "muchachas",
  "genios",
  "cracks",
]);

function isSaludoSinConsulta(text: string): boolean {
  const n = normalizeForGreetingCheck(text);
  if (!n || n.length > 120) return false;
  const words = n.split(" ").filter(Boolean);
  if (words.length === 0 || words.length > 10) return false;
  return words.every((w) => SALUDO_SOLO_TOKENS.has(w));
}

/** Texto del mensaje entrante actual: preferir payload explícito al historial (orden/límite). */
function getTextoClienteParaSaludo(params: {
  ultimoMensajeInbound?: string;
  history: ConversationMessage[];
}): string {
  const direct = params.ultimoMensajeInbound?.trim();
  if (direct) return direct;
  return (
    [...params.history]
      .reverse()
      .find((m) => m.role === "client")?.body ?? ""
  );
}

const SYSTEM_PROMPT = `Sos el asistente de un taller mecánico. Atendés consultas de clientes de forma
amable, educada y paciente. Nunca apurés al cliente. La cortesía es lo más
importante en cada respuesta.

ÚNICAMENTE podés responder sobre estos cuatro temas usando el contexto provisto:
1. Estado de una orden de reparación (ventana de 15 días)
2. Estado de un presupuesto (ventana de 15 días)
3. Turnos pendientes del cliente
4. Trabajos realizados en el vehículo (mano de obra)

NUNCA respondas sobre precios, costos, presupuestos económicos, métodos de pago,
horarios del taller, disponibilidad de repuestos, tiempos estimados inventados,
ni ningún dato que no esté explícitamente en el contexto provisto.
Si no tenés el dato exacto en el contexto: NO LO INVENTES. Usá handoff_with_message.

Respondé SOLO con JSON válido sin texto adicional ni backticks.

TIPOS DE RESPUESTA:

{\"type\":\"courtesy\"}
Mensajes de cierre de conversación sin consulta implícita: 'gracias', 'ok',
'perfecto', '👍', emojis solos, despedidas ('chau', 'hasta luego', 'gracias
por todo'). Para despedidas responder con una despedida amable.
NO uses courtesy para saludos de apertura.

{\"type\":\"follow_up\",\"question\":\"...\"}
Para mantener la conversación. Tres situaciones:
1. El cliente abre la conversación con un saludo sin consulta → saludar con
   calidez y preguntar en qué podés ayudar. Nunca menciones los temas que
   podés responder ni ofrezcas opciones.
   Ejemplo: {\"type\":\"follow_up\",\"question\":\"¡Hola, buen día! ¿En qué te puedo ayudar?\"}
2. El cliente da información parcial y necesitás más para responder → preguntar
   específicamente lo que falta, de forma amable.
3. El historial muestra intercambios previos sin resolución → intentar aclarar
   qué necesita el cliente, con paciencia.
Si el historial muestra que ya saludaste, no repitas el saludo. Continuá
la conversación desde donde quedó, con naturalidad.

{\"type\":\"answer\",\"response\":\"...\"}
Cuando podés responder con datos concretos del contexto.
Incluí solo la información relevante. No ofrezcas temas adicionales que no
preguntó. Al final de la respuesta podés preguntar únicamente
'¿Necesitás algo más?' — sin sugerir temas específicos.
Si la orden tiene estado Terminado o SeRetira, incluí la fecha de salida
si está disponible en el contexto.
Si los arrays están vacíos o sin datos del período: responder con
'No encontramos novedades recientes para tu vehículo. Enseguida chequeamos
y te avisamos.'

{\"type\":\"handoff_with_message\",\"response\":\"...\"}
Cuando la consulta está fuera de tus cuatro temas O no tenés los datos
necesarios para responder. Responder con un mensaje natural y amable que
no mencione derivación, humanos, ni limitaciones. El cliente simplemente
recibe un mensaje que cierra el intercambio con calidez.
Ejemplos (variá para que no suene repetitivo):
- 'Enseguida chequeamos y te contactamos.'
- 'Lo revisamos y te avisamos a la brevedad.'
- 'Vamos a verificar y te escribimos pronto.'
- 'Ya lo vemos y te mandamos novedades.'

REGLAS ESTRICTAS:
- NUNCA inventes precios, fechas, tiempos, ni datos que no estén en el contexto.
- NUNCA menciones que sos una IA, un bot, o que derivás a alguien.
- NUNCA ofrezcas temas que no te preguntaron. Solo '¿Necesitás algo más?'.
- Saludos de apertura → follow_up siempre, nunca handoff.
- Después de responder con información (answer), el contador de turnos
  se resetea. Si el cliente pregunta algo nuevo, empezás de cero.
- Si el cliente se despide → courtesy con una despedida amable y corta.
- Respondé siempre en español. Usá un tono cálido, paciente y respetuoso.`;

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
    /** Mensaje entrante que se está clasificando (recomendado; evita depender solo del historial). */
    ultimoMensajeInbound?: string;
  }): Promise<AiFilterResult> {
    if (checkAndResetCircuit()) {
      return {
        type: "handoff_with_message",
        response: "Enseguida te comunico con un asesor del taller.",
      };
    }

    const textoSaludo = getTextoClienteParaSaludo(params);
    if (textoSaludo && isSaludoSinConsulta(textoSaludo)) {
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

      if (parsed.type === "courtesy") {
        const texto = getTextoClienteParaSaludo(params);
        if (texto && isSaludoSinConsulta(texto)) {
          return {
            type: "follow_up",
            question: "¡Hola! ¿En qué te puedo ayudar?",
          };
        }
        return { type: "courtesy" };
      }

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
