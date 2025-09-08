import { handleApiError } from "@/shared/middleware/error-handler.middleware";

export async function GET(request: Request) {
  try {
  } catch (e) {
    handleApiError(e);
  }
}
