import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${params.mediaId}`,
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );

    if (!metaRes.ok) {
      if (metaRes.status === 400 || metaRes.status === 404) {
        return NextResponse.json({ expired: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Error al obtener el archivo" },
        { status: 502 }
      );
    }

    const data = await metaRes.json();

    if (!data.url) {
      return NextResponse.json({ expired: true }, { status: 200 });
    }

    return NextResponse.json(
      { url: data.url, mimeType: data.mime_type },
      { status: 200 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}

