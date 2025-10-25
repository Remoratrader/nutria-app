export interface Recipe {
  id: string;
  nome: string;
  name: string;
  categoria: string;
  category: string;
  cuisine: string;
  calorias: number;
  calories: number;
  tempo_preparo?: number;
  tempo_cozimento?: number;
  prepTime: number;
  emoji?: string;
  image: string;
  ingredientes?: string[];
  ingredients: string[];
  modo_preparo?: string[];
  instructions: string[];
  tags?: string[];
  proteinas?: number;
  carboidratos?: number;
  gorduras?: number;
  porcoes?: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export type Receita = Recipe;

export type Objetivo = 'lose' | 'maintain' | 'gain';
export type NivelAtividade = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TipoDieta = 'balanced' | 'low_carb' | 'high_protein' | 'vegetarian';
export const TipoDietaArray = ['balanced', 'low_carb', 'high_protein', 'vegetarian'] as const;
export type Sexo = 'male' | 'female' | 'other';

// Database schema types (PT-BR matching Supabase schema)
export interface DatabaseProfile {
  id: string;
  nome: string;
  idade: number | null;
  peso: number | null;
  altura: number | null;
  sexo: string | null;
  objetivo: string | null;
  nivel_atividade: string | null;
  tipo_dieta: string[] | null;
  meta_calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
  created_at: string;
  updated_at: string;
}

// Application types (EN for UI)
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  dailyCalories: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Mapper functions
export function dbProfileToUserProfile(dbProfile: DatabaseProfile): UserProfile {
  return {
    id: dbProfile.id,
    name: dbProfile.nome,
    age: dbProfile.idade || 0,
    weight: dbProfile.peso || 0,
    height: dbProfile.altura || 0,
    gender: dbProfile.sexo === 'masculino' ? 'male' : dbProfile.sexo === 'feminino' ? 'female' : 'other',
    activityLevel: dbProfile.nivel_atividade === 'sedentario' ? 'sedentary' :
                   dbProfile.nivel_atividade === 'leve' ? 'light' :
                   dbProfile.nivel_atividade === 'moderado' ? 'moderate' :
                   dbProfile.nivel_atividade === 'intenso' ? 'active' : 'very_active',
    goal: dbProfile.objetivo === 'perder_peso' ? 'lose' :
          dbProfile.objetivo === 'manter_peso' ? 'maintain' : 'gain',
    dailyCalories: dbProfile.meta_calorias || 0,
    macroTargets: {
      protein: dbProfile.proteinas || 0,
      carbs: dbProfile.carboidratos || 0,
      fat: dbProfile.gorduras || 0,
    },
  };
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number;
}

export interface DailyConsumption {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}
