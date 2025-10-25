import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to get all favorite recipe IDs
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('receitas_favoritas')
        .select('receita_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data as any[]).map((item: any) => item.receita_id);
    },
    enabled: !!user?.id,
  });

  // Check if a recipe is favorited
  const isFavorite = (recipeId: string) => {
    return favorites?.includes(recipeId) || false;
  };

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const isFav = isFavorite(recipeId);

      if (isFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('receitas_favoritas')
          .delete()
          .eq('user_id', user.id)
          .eq('receita_id', recipeId);

        if (error) throw error;
        return { action: 'removed', recipeId };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('receitas_favoritas')
          .insert({
            user_id: user.id,
            receita_id: recipeId,
          } as any);

        if (error) throw error;
        return { action: 'added', recipeId };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      
      toast({
        title: result.action === 'added' ? 'Receita favoritada!' : 'Removido dos favoritos',
        description: result.action === 'added' 
          ? 'A receita foi adicionada aos seus favoritos' 
          : 'A receita foi removida dos seus favoritos',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar favoritos',
        description: error.message,
      });
    },
  });

  return {
    favorites: favorites || [],
    isLoading,
    isFavorite,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending,
  };
};
