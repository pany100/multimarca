import { getMedia } from "@/services/notificaciones-whataspp-old";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mediaId = params.id;

  try {
    const { data, contentType } = await getMedia(params.id);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": data.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching audio URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio URL" },
      { status: 500 }
    );
  }
}
