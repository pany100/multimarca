import { POST } from "@/app/api/stock/update-by-provider/route";
import { NextRequest } from "next/server";

describe("POST /api/stock/update-by-provider", () => {
  it("debería devolver un error si faltan provider id", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ porcentajeAumento: 10 }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Faltan datos requeridos");
  });

  it("debería devolver un error si faltan porcentajeAumento", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/stock/update-by-provider",
      {
        method: "POST",
        body: JSON.stringify({ providerId: 1 }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Faltan datos requeridos");
  });
});
