import { z } from 'zod';

// Limits match the database columns (full_name 100, email 255, phone 20, business_name 150).
const email = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .max(255)
  .email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(128, 'Password is too long'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(100, 'Name is too long'),
    email,
    phone: z
      .string()
      .trim()
      .max(20, 'Phone number is too long')
      .regex(/^[+0-9 ()-]*$/, 'Use digits, spaces and + ( ) - only'),
    password: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterForm = z.infer<typeof registerSchema>;
