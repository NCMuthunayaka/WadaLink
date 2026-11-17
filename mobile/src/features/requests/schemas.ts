import { z } from 'zod';
import { URGENCY_LEVELS } from '@/types/request';

// Limits follow service_requests: description is TEXT, address is VARCHAR(255).
export const createRequestSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the problem in a few words (at least 10 characters)')
    .max(2000, 'Keep it under 2000 characters'),
  address: z.string().trim().min(5, 'Enter the service address').max(255, 'Address is too long'),
  urgency: z.enum(URGENCY_LEVELS),
});
export type CreateRequestForm = z.infer<typeof createRequestSchema>;
