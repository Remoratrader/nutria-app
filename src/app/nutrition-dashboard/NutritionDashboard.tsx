import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalorieCircle } from './CalorieCircle';
import { MacroBar } from './MacroBar';

interface NutritionDashboardProps {
  consumed: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  goals: {
    meta_calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    hidratacao_ml: number;
  };
}

export const NutritionDashboard = ({ consumed, goals }: NutritionDashboardProps) => {
  return (
    <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">Resumo Nutricional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Círculo de Calorias */}
        <div className="flex flex-col items-center">
          <CalorieCircle consumed={consumed.calorias} goal={goals.meta_calorias} />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Meta calórica</p>
            <p className="text-2xl font-bold text-primary">{goals.meta_calorias} kcal</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ingestão: <span className="font-semibold text-foreground">{consumed.calorias}</span> kcal
            </p>
          </div>
        </div>

        {/* Barras de Macros */}
        <div className="space-y-4">
          <MacroBar
            label="Proteína"
            current={consumed.proteinas}
            goal={goals.proteinas}
            color="protein"
          />
          <MacroBar
            label="Carboidrato"
            current={consumed.carboidratos}
            goal={goals.carboidratos}
            color="carbs"
          />
          <MacroBar
            label="Gordura"
            current={consumed.gorduras}
            goal={goals.gorduras}
            color="fats"
          />
        </div>

        {/* Hidratação - Será substituída pelo componente HydrationWidget */}
      </CardContent>
    </Card>
  );
};
