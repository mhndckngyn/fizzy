import * as z from "zod";

export const verifyToken = z.object({
  token: z.string(),
});
