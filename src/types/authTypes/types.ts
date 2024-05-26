import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().min(2).max(50),
  password: z
    .string()
    .min(6, "The password field must be at least 6 characters.")
    .max(50),
});
export const regsiterSchema = z.object({
  fullname: z.string().min(1, "The full name field is required.").max(50),
  email: z.string().min(2).max(50),
  password: z
    .string()
    .min(6, "The password field must be at least 6 characters.")
    .max(50),
  confirmPassword: z.string().min(8).max(50),
  username: z
    .string()
    .min(
      3,
      "The username field must be at least 3 characters and contain only alphanumeric characters, dots, or underscores."
    )
    .max(15)
    .regex(
      /^[\w.]+$/,
      "The username field must be at least 3 characters and contain only alphanumeric characters, dots, or underscores."
    ),
  phone: z.string().min(13).max(14),
});
