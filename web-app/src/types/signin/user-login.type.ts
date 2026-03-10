import * as z from "zod";

export const userLogin = z.object({
  email: z.email({ message: "Invalid email address" }),
});
