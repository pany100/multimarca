import { ZodSchema } from "zod";

export async function validateRequest<T>(
  payload: unknown,
  schema: ZodSchema<T>
): Promise<T> {
  return await schema.parseAsync(payload);
}
