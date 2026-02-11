import { z } from "zod";

export const markAllNotificationsReadSchema = z.object({
  userId: z.coerce.number().int().positive("El userId es requerido"),
});

export type MarkAllNotificationsReadDto = z.infer<
  typeof markAllNotificationsReadSchema
>;

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(200).default(10),
  leidas: z
    .enum(["true", "false"])
    .optional()
    .transform((v): boolean | null => (v === undefined ? null : v === "true")),
});

export type ListNotificationsQueryDto = z.infer<
  typeof listNotificationsQuerySchema
>;
