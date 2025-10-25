import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { format, subDays } from 'date-fns';

export const useWeeklyProgress = () => {
  const { user } = useAuth();

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['weeklyProgress', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const today = new Date();
      const sevenDaysAgo = subDays(today, 6);
      
      const { data, error } = await supabase
        .from('consumo_diario')
        .select('data, calorias')
        .eq('user_id', user.id)
        .gte('data', format(sevenDaysAgo, 'yyyy-MM-dd'))
        .lte('data', format(today, 'yyyy-MM-dd'))
        .order('data', { ascending: true });

      if (error) throw error;

      // Get user's calorie target
      const { data: profile } = await supabase
        .from('profiles')
        .select('meta_calorias')
        .eq('id', user.id)
        .maybeSingle();

      const target = (profile as any)?.meta_calorias ?? 2000;

      // Create array with all 7 days (fill missing days with 0)
      const daysMap = new Map(
        (data || []).map(item => [item.data, item.calorias || 0])
      );

      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const result = [];

      for (let i = 0; i < 7; i++) {
        const date = subDays(today, 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayName = weekDays[date.getDay()];

        result.push({
          day: dayName,
          calories: daysMap.get(dateStr) || 0,
          target,
        });
      }

      return result;
    },
    enabled: !!user?.id,
  });

  return {
    weeklyData: weeklyData || [],
    loading: isLoading,
    isLoading,
  };
};
