const BASE_URL = "https://graph.facebook.com/v19.0";

export class MetaClient {
  constructor() {}

  private get token() {
    const token = process.env.WHATSAPP_TOKEN;
    if (!token) throw new Error("WHATSAPP_TOKEN no está configurado");
    return token;
  }

  private get phoneNumberId() {
    const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!id) throw new Error("WHATSAPP_PHONE_NUMBER_ID no está configurado");
    return id;
  }

  async sendText(to: string, body: string): Promise<{ waMessageId: string }> {
    const res = await this._post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    });
    return { waMessageId: res.messages[0].id };
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: object[]
  ): Promise<{ waMessageId: string }> {
    const res = await this._post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components ?? [],
      },
    });
    return { waMessageId: res.messages[0].id };
  }

  private async _post(path: string, body: object): Promise<any> {
    const url = `${BASE_URL}/${this.phoneNumberId}${path}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? "Meta API error");
    }

    return response.json();
  }
}

export const metaClient = new MetaClient();

