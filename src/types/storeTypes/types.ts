import { z } from "zod";
export const authSchema = z.object({
  fullname: z.string().max(50),
  email: z.string().min(2).max(50),
  username: z.string().min(3).max(15),
});
