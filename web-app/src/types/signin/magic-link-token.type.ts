import * as z from "zod";

export const magicLinkToken = z.object({
  token: z.string(),
});
