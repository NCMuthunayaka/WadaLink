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
  password: z.string().min(1, 'Enter your password'),
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
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterForm = z.infer<typeof registerSchema>;

// Numbers are kept as strings in the form and converted on submit.
export const providerSetupSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Enter your business or display name')
    .max(150, 'Name is too long'),
  bio: z.string().trim().max(1000, 'Keep it under 1000 characters'),
  experienceYears: z.string().regex(/^\d{1,2}$/, 'Enter whole years (0 to 99)'),
  hourlyRate: z.string().regex(/^(\d{1,8}(\.\d{1,2})?)?$/, 'Enter an amount like 85 or 85.50'),
});
export type ProviderSetupForm = z.infer<typeof providerSetupSchema>;