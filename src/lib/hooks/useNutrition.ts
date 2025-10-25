import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { dbProfileToUserProfile, type DatabaseProfile } from '@/types/nutrition';
import { useToast } from './use-toast';

export const useNutrition = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return dbProfileToUserProfile(data as DatabaseProfile);
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<DatabaseProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const supabaseClient = supabase as any;
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message,
      });
    },
  });

  return {
    profile: profile ? {
      ...profile,
      nome: profile.name,
      idade: profile.age,
      peso: profile.weight,
      altura: profile.height,
      meta_calorias: profile.dailyCalories,
      proteinas: profile.macroTargets.protein,
      carboidratos: profile.macroTargets.carbs,
      gorduras: profile.macroTargets.fat,
      hidratacao_ml: 2000,
    } : null,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
  };
};
