import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

const META_MEDIA = (mediaId: string) =>
  `https://graph.facebook.com/v19.0/${mediaId}`;

/**
 * Descarga el binario desde Meta (la URL de lookaside exige Bearer; el navegador
 * no puede usarla en <img> / <audio> directamente).
 */
export async function GET(
  request: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = process.env.WHATSAPP_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Token de WhatsApp no configurado" },
        { status: 500 }
      );
    }

    const metaRes = await fetch(META_MEDIA(params.mediaId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!metaRes.ok) {
      if (metaRes.status === 400 || metaRes.status === 404) {
        return NextResponse.json({ expired: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Error al obtener el archivo" },
        { status: 502 }
      );
    }

    const data = (await metaRes.json()) as {
      url?: string;
      mime_type?: string;
    };

    if (!data.url) {
      return NextResponse.json({ expired: true }, { status: 200 });
    }

    const fileRes = await fetch(data.url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fileRes.ok) {
      return NextResponse.json(
        { error: "Error al descargar el archivo" },
        { status: 502 }
      );
    }

    const buffer = await fileRes.arrayBuffer();
    const contentType =
      data.mime_type ||
      fileRes.headers.get("content-type") ||
      "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
