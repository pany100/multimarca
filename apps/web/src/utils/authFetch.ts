import { getCookie } from "cookies-next";
import prisma from "src/lib/prisma";

const authFetch = async (
  url: string,
  options: RequestInit = {},
  req?: any,
  res?: any
) => {
  let token;
  if (typeof window === "undefined") {
    // Estamos en el servidor
    token = getCookie("auth_token", { req, res });
  } else {
    // Estamos en el cliente
    token = getCookie("auth_token");
  }
  let fullUrl = url;
  if (!url.startsWith("http")) {
    if (typeof window === "undefined") {
      // Estamos en el servidor
      const { headers } = await import("next/headers");
      const headersList = headers();
      const host = headersList.get("host") || "localhost:3000";
      const proto = headersList.get("x-forwarded-proto") || "http";
      const baseUrl = `${proto}://${host}`;
      fullUrl = `${baseUrl}${url}`;
    } else {
      // Estamos en el cliente
      fullUrl = `${window.location.origin}${url}`;
    }
  }

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(fullUrl, { ...options, headers });
};

export async function getCurrentUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("No autorizado");
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  // Obtener el rol del usuario desde la base de datos
  const user = await prisma.usuario.findUnique({
    where: { id: decodedToken.userId },
    include: {
      rol: true,
    },
  });
  return user;
}

export default authFetch;
