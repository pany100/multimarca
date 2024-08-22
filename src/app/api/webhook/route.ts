import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  console.log("mode", mode);
  console.log("token", token);
  console.log("challenge", challenge);

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Verificación fallida", { status: 403 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.object === "whatsapp_business_account") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages") {
          for (const message of change.value.messages) {
            await handleIncomingMessage(message);
          }
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}

async function handleIncomingMessage(message: any) {
  const from = message.from;
  const text = message.text?.body;

  console.log(`Mensaje recibido de ${from}: ${text}`);
}
