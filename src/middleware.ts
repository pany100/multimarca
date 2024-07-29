import { JwtPayload } from "jsonwebtoken"; // Asegúrate de importar JwtPayload
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth/authService";

export async function middleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const decoded = (await verifyToken(token)) as JwtPayload & {
      userId: string;
      email: string;
    };
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-email", decoded.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/usuarios/:path*",
    "/api/clientes/:path*",
    "/api/stock/:path*",
    "/api/ventas/:path*",
    "/api/notificaciones/:path*",
    "/api/estadisticas/:path*",
    "/api/categorias-gasto/:path*",
    "/api/controles-mecanicos/:path*",
    "/api/extracciones/:path*",
    "/api/gastos/:path*",
    "/api/ingresos-reparacion/:path*",
    "/api/mano-de-obra/:path*",
    "/api/mecanicos/:path*",
    "/api/notificaciones-whatsapp/:path*",
    "/api/orden-de-compra/:path*",
    "/api/orden-reparacion/:path*",
    "/api/pago-a-mecanico/:path*",
    "/api/permisos/:path*",
    "/api/proveedores/:path*",
    "/api/roles/:path*",
    "/api/ventas/:path*",
    // Agrega aquí más rutas segn sea necesario
  ],
};
