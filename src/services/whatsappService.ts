import axios from "axios";

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
    to: "1156007307",
    type: "template",
    template: {
      name: nombreDelTemplate,
      language: { code: "es_AR" },
      components: components,
    },
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("Mensaje enviado con éxito:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
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
    new Blob([pdfBuffer], { type: "application/pdf" }),
    "resumen.pdf"
  );
  formData.append("messaging_product", "whatsapp");

  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await axios.post(mediaUrl, formData, { headers });
    console.log("Archivo subido con éxito:", response.data);
    return response.data.id;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
}

export { sendWhatsAppMessage, uploadMedia };
