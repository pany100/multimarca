import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Aquí iría la lógica para enviar la notificación

    // Si todo sale bien, devolvemos un 200
    return NextResponse.json(
      { message: "Notificación enviada con éxito" },
      { status: 200 }
    );
  } catch (error) {
    // En caso de error, podrías manejarlo aquí
    console.error("Error al enviar la notificación:", error);
    return NextResponse.json(
      { error: "Error al enviar la notificación" },
      { status: 500 }
    );
  }
}
