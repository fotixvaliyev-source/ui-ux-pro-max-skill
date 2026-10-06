import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  email,
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});
