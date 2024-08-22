import { getIO } from "@/lib/socketio";
import { saveMessage } from "@/services/whatsappService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Verificación fallida", { status: 403 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Received webhook body:", JSON.stringify(body, null, 2));

  if (body.object === "whatsapp_business_account") {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "messages") {
          const messages = change.value?.messages || [];
          if (Array.isArray(messages)) {
            for (const message of messages) {
              await handleIncomingMessage(message);
            }
          } else if (typeof messages === "object" && messages !== null) {
            await handleIncomingMessage(messages);
          }
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}
async function handleIncomingMessage(message: any) {
  const from = message.from;
  let tipo = "desconocido";
  let body = "";

  if (message.type === "text") {
    tipo = "texto";
    body = message.text.body;
  } else if (message.type === "audio") {
    tipo = "audio";
    body = message.audio.url;
  } else if (message.type === "image") {
    tipo = "imagen";
    body = message.image.url;
  } else if (message.type === "document") {
    tipo = "documento";
    body = `${message.document.filename} - ${message.document.url}`;
  }
  const response = await saveMessage(from, "me", body, tipo);
  if (response) {
    const io = getIO();
    if (io) {
      io.emit("whatsappNotification");
    }
  }
}
