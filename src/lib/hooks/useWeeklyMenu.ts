import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { startOfWeek, addDays, addWeeks, format } from 'date-fns';

export type MealType = 'cafe_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar';

export interface WeeklyMenuItem {
  id: string;
  data: string;
  tipo_refeicao: MealType;
  receita_id: string;
  porcoes: number;
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MEAL_TYPES: MealType[] = ['cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'];

export const useWeeklyMenu = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Week offset state (0 = current week, 1 = next week, -1 = previous week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Get week start based on offset
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 0 }); // Sunday

  // Query to get all meals for the current week
  const { data: weeklyMeals, isLoading } = useQuery({
    queryKey: ['weeklyMenu', user?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const weekEnd = addDays(weekStart, 6);

      const { data, error } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', format(weekStart, 'yyyy-MM-dd'))
        .lte('data', format(weekEnd, 'yyyy-MM-dd'))
        .order('data', { ascending: true })
        .order('tipo_refeicao', { ascending: true });

      if (error) throw error;
      return data as WeeklyMenuItem[];
    },
    enabled: !!user?.id,
  });

  // Add meal to weekly menu
  const addMealMutation = useMutation({
    mutationFn: async (meal: {
      dayIndex: number;
      mealType: MealType;
      receitaId: string;
      porcoes: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const mealDate = addDays(weekStart, meal.dayIndex);

      const { error } = await supabase
        .from('refeicoes')
        .insert({
          user_id: user.id,
          data: format(mealDate, 'yyyy-MM-dd'),
          tipo_refeicao: meal.mealType,
          receita_id: meal.receitaId,
          porcoes: meal.porcoes,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['weeklyMenu', user?.id, format(weekStart, 'yyyy-MM-dd')] 
      });
      toast({
        title: 'Refeição adicionada',
        description: 'A refeição foi adicionada ao seu cardápio semanal',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar refeição',
        description: error.message,
      });
    },
  });

  // Remove meal from weekly menu
  const removeMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('refeicoes')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['weeklyMenu', user?.id, format(weekStart, 'yyyy-MM-dd')] 
      });
      toast({
        title: 'Refeição removida',
        description: 'A refeição foi removida do cardápio',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover refeição',
        description: error.message,
      });
    },
  });

  // Get meals for a specific day and meal type
  const getMealsForSlot = (dayIndex: number, mealType: MealType) => {
    if (!weeklyMeals) return [];
    
    const targetDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
    
    return weeklyMeals.filter(
      meal => meal.data === targetDate && meal.tipo_refeicao === mealType
    );
  };

  return {
    weeklyMeals: weeklyMeals || [],
    isLoading,
    weekStart,
    weekOffset,
    setWeekOffset,
    goToPreviousWeek: () => setWeekOffset(prev => prev - 1),
    goToNextWeek: () => setWeekOffset(prev => prev + 1),
    goToCurrentWeek: () => setWeekOffset(0),
    daysOfWeek: DAYS_OF_WEEK,
    mealTypes: MEAL_TYPES,
    getMealsForSlot,
    addMeal: addMealMutation.mutate,
    removeMeal: removeMealMutation.mutate,
    isAddingMeal: addMealMutation.isPending,
    isRemovingMeal: removeMealMutation.isPending,
  };
};
