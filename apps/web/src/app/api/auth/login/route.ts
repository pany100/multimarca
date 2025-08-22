import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/authService";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const { token, user } = await loginUser(email, password);

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }
}
