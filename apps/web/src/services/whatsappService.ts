import { PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "../lib/logger.js";
const prisma = new PrismaClient();

async function sendWhatsappTextMessage(numeroDestino: string, body: string) {
  const numberId = process.env.NUMBER_ID;
  const apiVersion = process.env.API_VERSION || "v18.0";
  const url = `https://graph.facebook.com/${apiVersion}/${numberId}/messages`;
  const authToken = process.env.AUTH_TOKEN;

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${authToken}`,
  };

  const data = {
    messaging_product: "whatsapp",
    to: "5491156007307",
    type: "text",
    text: { body: body },
  };

  try {
    const response = await axios.post(url, data, { headers });
    logger.info("[WhatsAppService] Mensaje de texto enviado con éxito", {
      to: numeroDestino,
      messageId: response.data.messages?.[0]?.id,
    });
    await saveMessage("me", "5491156007307", body, "texto");
    return response.data;
  } catch (error) {
    logger.error("[WhatsAppService] Error al enviar mensaje de texto", {
      to: numeroDestino,
      error,
    });
    throw error;
  }
}

async function sendWhatsAppMessage(
  numeroDestino: string,
  nombreDelTemplate: string,
  args?: string[],
  mediaId?: string
) {
  const numberId = process.env.NUMBER_ID;
  const apiVersion = process.env.API_VERSION || "v18.0";
  const url = `https://graph.facebook.com/${apiVersion}/${numberId}/messages`;
  const authToken = process.env.AUTH_TOKEN;

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${authToken}`,
  };

  const components: any[] = [];

  if (mediaId) {
    components.push({
      type: "header",
      parameters: [
        {
          type: "document",
          document: {
            id: mediaId,
            filename: "Resumen.pdf",
          },
        },
      ],
    });
  }

  if (args) {
    components.push({
      type: "body",
      parameters: args.map((arg) => ({ type: "text", text: arg })),
    });
  }

  const data = {
    messaging_product: "whatsapp",
    to: "5491156007307",
    type: "template",
    template: {
      name: nombreDelTemplate,
      language: { code: "es_AR" },
      components: components,
    },
  };

  let bodyText = `Template: ${nombreDelTemplate}\n`;
  if (args) {
    bodyText += `Argumentos: ${args.join(", ")}\n`;
  }
  if (mediaId) {
    bodyText += `Documento adjunto: ${mediaId}\n`;
  }

  try {
    const response = await axios.post(url, data, { headers });
    logger.info("[WhatsAppService] Template enviado con éxito", {
      to: numeroDestino,
      template: nombreDelTemplate,
      messageId: response.data.messages?.[0]?.id,
    });
    await saveMessage("me", "5491156007307", bodyText, "template_enviado");
    return response.data;
  } catch (error) {
    logger.error("[WhatsAppService] Error al enviar template", {
      to: numeroDestino,
      template: nombreDelTemplate,
      error,
    });
    throw error;
  }
}

async function uploadMedia(pdfBuffer: Buffer): Promise<string> {
  const numeroId = process.env.NUMBER_ID || "148065758386723";
  const apiVersion = process.env.API_VERSION || "v18.0";
  const mediaUrl = `https://graph.facebook.com/${apiVersion}/${numeroId}/media`;
  const authToken = process.env.AUTH_TOKEN;

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
    "resumen.pdf"
  );
  formData.append("messaging_product", "whatsapp");

  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await axios.post(mediaUrl, formData, { headers });
    logger.info("[WhatsAppService] Archivo subido con éxito", {
      mediaId: response.data.id,
    });
    return response.data.id;
  } catch (error) {
    logger.error("[WhatsAppService] Error al subir el archivo", { error });
    throw error;
  }
}

async function getMedia(mediaId: string) {
  const numeroId = process.env.NUMBER_ID || "148065758386723";
  const apiVersion = process.env.API_VERSION || "v18.0";
  const mediaUrl = `https://graph.facebook.com/${apiVersion}/${mediaId}?phone_number_id=${numeroId}`;
  const authToken = process.env.AUTH_TOKEN;
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await axios.get(mediaUrl, { headers });
    const imageUrl = response.data.url;
    const mediaResponse = await axios.get(imageUrl, {
      headers,
      responseType: "arraybuffer",
    });

    return {
      data: Buffer.from(mediaResponse.data),
      contentType: mediaResponse.headers["content-type"],
    };
  } catch (error) {
    logger.error("[WhatsAppService] Error al obtener el archivo", {
      mediaId,
      error,
    });
    throw error;
  }
}

async function saveMessage(
  from: string,
  to: string,
  body: string,
  tipo: string
) {
  const clientNumber = to === "me" ? from : to;
  const ultimosOchoDigitos = clientNumber.slice(-8);
  const cliente = await prisma.cliente.findFirst({
    where: {
      phone: {
        endsWith: ultimosOchoDigitos,
      },
    },
  });

  if (!cliente) {
    logger.warn("[WhatsAppService] No se encontró cliente para el número", {
      from,
      clientNumber,
    });
    return false;
  }

  try {
    let conversacion = await prisma.conversacionWhatsApp.findFirst({
      where: {
        cliente: { id: cliente.id },
        estado: "Activa",
      },
    });

    if (!conversacion) {
      conversacion = await prisma.conversacionWhatsApp.create({
        data: {
          cliente: { connect: { id: cliente.id } },
          estado: "Activa",
        },
      });
    }

    // Crear el mensaje y asociarlo a la conversación
    await prisma.mensajeWhatsApp.create({
      data: {
        from,
        body,
        tipo,
        to,
        conversacion: { connect: { id: conversacion.id } },
        read: from === "me" ? true : false,
      },
    });

    // Actualizar la fecha del último mensaje en la conversación
    await prisma.conversacionWhatsApp.update({
      where: { id: conversacion.id },
      data: { ultimoMensaje: new Date() },
    });

    logger.info("[WhatsAppService] Mensaje guardado en la conversación", {
      tipo,
      from,
      conversacionId: conversacion.id,
    });
    return true;
  } catch (error) {
    logger.error(
      "[WhatsAppService] Error al guardar el mensaje en la base de datos",
      { from, tipo, error }
    );
    return false;
  }
}

export {
  getMedia,
  saveMessage,
  sendWhatsAppMessage,
  sendWhatsappTextMessage,
  uploadMedia,
};
