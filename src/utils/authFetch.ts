import { getCookie } from "cookies-next";

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
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(fullUrl, { ...options, headers });
};

export default authFetch;
