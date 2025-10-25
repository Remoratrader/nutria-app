import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useHydration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const { data: hydration, isLoading } = useQuery({
    queryKey: ['hydration', user?.id, today],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('hidratacao')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today)
        .maybeSingle();

      if (error) throw error;

      // Return default if no data exists
      return data || {
        copos_consumidos: 0,
        meta_copos: 8,
        ml_por_copo: 250,
      };
    },
    enabled: !!user?.id,
  });

  const updateHydrationMutation = useMutation({
    mutationFn: async (coposChange: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      const currentCopos = hydration?.copos_consumidos || 0;
      const newCopos = Math.max(0, currentCopos + coposChange);

      const { data, error } = await supabase
        .from('hidratacao')
        .upsert({
          user_id: user.id,
          data: today,
          copos_consumidos: newCopos,
          meta_copos: hydration?.meta_copos || 8,
          ml_por_copo: hydration?.ml_por_copo || 250,
        } as any, {
          onConflict: 'user_id,data',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration', user?.id, today] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar hidratação',
        description: error.message,
      });
    },
  });

  return {
    hydration: hydration || {
      copos_consumidos: 0,
      meta_copos: 8,
      ml_por_copo: 250,
    },
    loading: isLoading,
    addCopo: () => updateHydrationMutation.mutate(1),
    removeCopo: () => updateHydrationMutation.mutate(-1),
  };
};
