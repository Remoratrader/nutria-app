import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNutrition } from '@/hooks/useNutrition';
import { useDailyConsumption } from '@/hooks/useDailyConsumption';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/nutrition';
import { NutritionDashboard } from '@/components/nutrition/NutritionDashboard';
import { HydrationWidget } from '@/components/nutrition/HydrationWidget';
import { NutritionInsights } from '@/components/nutrition/NutritionInsights';
import { WeeklyProgressChart } from '@/components/nutrition/WeeklyProgressChart';
import { AddManualFoodDialog } from '@/components/meals/AddManualFoodDialog';
import { FoodSelectionGrid } from '@/components/meals/FoodSelectionGrid';
import { ProfileWizard } from '@/components/profile/ProfileWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, LogOut, Settings, Calendar, Heart, Package, ShoppingCart } from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { profile: nutritionProfile, isLoading: nutritionLoading } = useNutrition();
  const { consumption, refresh } = useDailyConsumption();

  const isProfileComplete = profile && profile.age && profile.weight && profile.height;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      // Import mapper at top of file
      const { dbProfileToUserProfile } = await import('@/types/nutrition');
      setProfile(dbProfileToUserProfile(data));
    }
    setProfileLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || profileLoading || nutritionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Leaf className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se o perfil não está completo, mostra o wizard de onboarding
  if (!isProfileComplete) {
    return <ProfileWizard userId={user.id} onComplete={setProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">NUTRIA</h1>
                <p className="text-xs text-muted-foreground">Planejador Alimentar Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/weekly-menu')}>
                <Calendar className="h-4 w-4 mr-2" />
                Cardápio
              </Button>
              <Button variant="outline" onClick={() => navigate('/pantry')}>
                <Package className="h-4 w-4 mr-2" />
                Dispensa
              </Button>
              <Button variant="outline" onClick={() => navigate('/shopping-list')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button variant="outline" onClick={() => navigate('/favorites')}>
                <Heart className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
              <ThemeSelector />
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Boas-vindas */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              Olá, {profile?.name || user.email?.split('@')[0]}! 👋
            </h2>
            <p className="text-muted-foreground">
              Pronto para planejar suas refeições de hoje?
            </p>
          </div>

          {/* Dashboard Nutricional e Insights */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Acompanhamento Diário</h3>
              <AddManualFoodDialog userId={user.id} onSuccess={refresh} />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {nutritionProfile && (
                <NutritionDashboard consumed={consumption} goals={nutritionProfile} />
              )}
              <HydrationWidget userId={user.id} />
            </div>

            {nutritionProfile && (
              <NutritionInsights consumed={consumption} goals={nutritionProfile} />
            )}
          </div>

          {/* Progresso Semanal */}
          {nutritionProfile?.meta_calorias && (
            <WeeklyProgressChart userId={user.id} metaCalorias={nutritionProfile.meta_calorias} />
          )}

          {/* Grid de Seleção de Receitas */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="pt-6">
              <FoodSelectionGrid />
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          NutrIA v1.2.0-dev • Planejador Alimentar Inteligente
        </p>
      </footer>
    </div>
  );
};

export default Index;
