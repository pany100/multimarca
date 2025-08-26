import { NextResponse } from "next/server";
export const ResponseBuilder = {
  ok: (data: unknown) => NextResponse.json(data, { status: 200 }),
};
