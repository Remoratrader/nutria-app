import { z } from 'zod';

export const manualFoodSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  calorias: z.number().min(0),
  proteinas: z.number().min(0),
  carboidratos: z.number().min(0),
  gorduras: z.number().min(0),
  tipo_refeicao: z.string().optional(),
});

export const porcoesSchema = z.object({
  porcoes: z.number().min(0.1).max(10),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  age: z.number().min(10).max(120),
  weight: z.number().min(20).max(300),
  height: z.number().min(100).max(250),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

export type ManualFoodInput = z.infer<typeof manualFoodSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
