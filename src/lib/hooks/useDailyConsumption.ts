import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { recipes as recipesData } from '@/data/ecipes';

export const useDailyConsumption = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const { data: consumption, isLoading, refetch } = useQuery({
    queryKey: ['dailyConsumption', user?.id, today],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch consumo_diario (aggregate totals)
      const { data: consumoDiario, error: consumoError } = await supabase
        .from('consumo_diario')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today)
        .maybeSingle();

      if (consumoError) throw consumoError;

      // Fetch refeicoes (meals from recipes)
      const { data: refeicoes, error: refeicoesError } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today);

      if (refeicoesError) throw refeicoesError;

      // Fetch consumo_manual (manually added foods)
      const { data: consumoManual, error: manualError } = await supabase
        .from('consumo_manual')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today);

      if (manualError) throw manualError;

      // Calculate nutrition from recipes
      const receitasTotals = (refeicoes || []).reduce(
        (acc, refeicao) => {
          const recipe = recipesData.find(r => r.id === refeicao.receita_id);
          if (!recipe) return acc;

          const porcoes = Number(refeicao.porcoes) || 1;
          
          return {
            calorias: acc.calorias + (recipe.calories * porcoes),
            proteinas: acc.proteinas + (recipe.macros.protein * porcoes),
            carboidratos: acc.carboidratos + (recipe.macros.carbs * porcoes),
            gorduras: acc.gorduras + (recipe.macros.fat * porcoes),
          };
        },
        { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
      );

      // Aggregate totals from consumo_manual
      const manualTotals = (consumoManual || []).reduce(
        (acc, item) => ({
          calorias: acc.calorias + (item.calorias || 0),
          proteinas: acc.proteinas + (Number(item.proteinas) || 0),
          carboidratos: acc.carboidratos + (Number(item.carboidratos) || 0),
          gorduras: acc.gorduras + (Number(item.gorduras) || 0),
        }),
        { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
      );

      // Combine all sources: consumo_diario + recipes + manual
      const consumoDiarioData = consumoDiario as any;
      const totals = {
        calorias: ((consumoDiarioData?.calorias ?? 0) as number) + receitasTotals.calorias + manualTotals.calorias,
        proteinas: (Number(consumoDiarioData?.proteinas ?? 0) as number) + receitasTotals.proteinas + manualTotals.proteinas,
        carboidratos: (Number(consumoDiarioData?.carboidratos ?? 0) as number) + receitasTotals.carboidratos + manualTotals.carboidratos,
        gorduras: (Number(consumoDiarioData?.gorduras ?? 0) as number) + receitasTotals.gorduras + manualTotals.gorduras,
      };

      return totals;
    },
    enabled: !!user?.id,
  });

  const addMealMutation = useMutation({
    mutationFn: async (mealData: {
      receita_id: string;
      tipo_refeicao: string;
      porcoes: number;
      nutritionInfo: {
        calorias: number;
        proteinas: number;
        carboidratos: number;
        gorduras: number;
      };
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Insert meal into refeicoes table
      const { error: refeicaoError } = await supabase
        .from('refeicoes')
        .insert({
          user_id: user.id,
          data: today,
          receita_id: mealData.receita_id,
          tipo_refeicao: mealData.tipo_refeicao,
          porcoes: mealData.porcoes,
        } as any);

      if (refeicaoError) throw refeicaoError;

      // Update or create consumo_diario with aggregated totals
      const currentTotals = consumption || { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
      
      const { error: consumoError } = await supabase
        .from('consumo_diario')
        .upsert({
          user_id: user.id,
          data: today,
          calorias: currentTotals.calorias + mealData.nutritionInfo.calorias,
          proteinas: currentTotals.proteinas + mealData.nutritionInfo.proteinas,
          carboidratos: currentTotals.carboidratos + mealData.nutritionInfo.carboidratos,
          gorduras: currentTotals.gorduras + mealData.nutritionInfo.gorduras,
        } as any, {
          onConflict: 'user_id,data',
        });

      if (consumoError) throw consumoError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyConsumption', user?.id, today] });
      toast({
        title: 'Refeição adicionada',
        description: 'Seu consumo foi atualizado',
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

  return {
    consumption: consumption || {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
    },
    isLoading,
    addMeal: addMealMutation.mutate,
    updateWater: async () => {}, // Water is handled by useHydration
    refresh: refetch,
  };
};
