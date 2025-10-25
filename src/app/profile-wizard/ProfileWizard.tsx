import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/nutrition';

type Sexo = 'masculino' | 'feminino' | 'outro';
type Objetivo = 'perder_peso' | 'ganhar_peso' | 'manter_peso' | 'ganhar_massa';
type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
type TipoDieta = 'balanceada' | 'low_carb' | 'keto' | 'vegetariana' | 'vegana' | 'paleo';
type TipoDietaArray = TipoDieta[];
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Leaf, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  idade: z.coerce.number().min(10, 'Idade mínima: 10 anos').max(120, 'Idade máxima: 120 anos'),
  peso: z.coerce.number().min(30, 'Peso mínimo: 30kg').max(300, 'Peso máximo: 300kg'),
  altura: z.coerce.number().min(100, 'Altura mínima: 100cm').max(250, 'Altura máxima: 250cm'),
  sexo: z.enum(['masculino', 'feminino', 'outro'] as const),
  objetivo: z.enum(['perder_peso', 'ganhar_peso', 'manter_peso', 'ganhar_massa'] as const),
  nivel_atividade: z.enum(['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'] as const),
  tipo_dieta: z.array(z.enum(['balanceada', 'low_carb', 'keto', 'vegetariana', 'vegana', 'paleo'] as const)).min(1, 'Selecione pelo menos um tipo de dieta'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileWizardProps {
  userId: string;
  onComplete: (profile: UserProfile) => void;
}

const STEPS = [
  { id: 1, title: 'Informações Básicas', description: 'Vamos começar conhecendo você' },
  { id: 2, title: 'Seus Objetivos', description: 'O que você deseja alcançar?' },
  { id: 3, title: 'Seu Estilo de Vida', description: 'Como é sua rotina?' },
];

export const ProfileWizard = ({ userId, onComplete }: ProfileWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      sexo: 'outro',
      objetivo: 'manter_peso',
      nivel_atividade: 'moderado',
      tipo_dieta: ['balanceada'],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProfileFormData) => {
    console.log('🚀 [ProfileWizard] Iniciando submit do formulário');
    console.log('📝 [ProfileWizard] Dados do formulário:', data);
    console.log('👤 [ProfileWizard] User ID:', userId);
    
    setLoading(true);
    try {
      // Calcular calorias base (TMB - Taxa Metabólica Basal)
      const tmb = data.sexo === 'masculino' 
        ? 88.362 + (13.397 * data.peso) + (4.799 * data.altura) - (5.677 * data.idade)
        : 447.593 + (9.247 * data.peso) + (3.098 * data.altura) - (4.330 * data.idade);

      // Multiplicadores de atividade
      const atividadeMultiplicadores: Record<typeof data.nivel_atividade, number> = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725,
        muito_intenso: 1.9,
      };

      // Calcular calorias diárias
      let metaCalorias = tmb * atividadeMultiplicadores[data.nivel_atividade];

      // Ajustar baseado no objetivo
      if (data.objetivo === 'perder_peso') metaCalorias *= 0.85;
      else if (data.objetivo === 'ganhar_peso' || data.objetivo === 'ganhar_massa') metaCalorias *= 1.15;

      metaCalorias = Math.round(metaCalorias);

      // Calcular macros (40% carbs, 30% proteína, 30% gordura)
      const proteinas = Math.round((metaCalorias * 0.3) / 4);
      const carboidratos = Math.round((metaCalorias * 0.4) / 4);
      const gorduras = Math.round((metaCalorias * 0.3) / 9);

      // Mapear tipos de enums para UserProfile
      const genderMap: Record<Sexo, 'male' | 'female' | 'other'> = {
        masculino: 'male',
        feminino: 'female',
        outro: 'other',
      };

      const activityMap: Record<NivelAtividade, 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'> = {
        sedentario: 'sedentary',
        leve: 'light',
        moderado: 'moderate',
        intenso: 'active',
        muito_intenso: 'very_active',
      };

      const goalMap: Record<Objetivo, 'lose' | 'gain' | 'maintain'> = {
        perder_peso: 'lose',
        ganhar_peso: 'gain',
        manter_peso: 'maintain',
        ganhar_massa: 'gain', // ganhar massa também usa 'gain'
      };

      // Criar perfil completo
      const completeProfile: UserProfile = {
        id: userId,
        name: data.nome,
        age: data.idade,
        weight: data.peso,
        height: data.altura,
        gender: genderMap[data.sexo],
        activityLevel: activityMap[data.nivel_atividade],
        goal: goalMap[data.objetivo],
        dailyCalories: metaCalorias,
        macroTargets: {
          protein: proteinas,
          carbs: carboidratos,
          fat: gorduras,
        },
      };

      // Salvar no localStorage (mock mode)
      localStorage.setItem(`profile_${userId}`, JSON.stringify(completeProfile));
      console.log('✅ [ProfileWizard] Perfil salvo no localStorage:', completeProfile);

      // Tentar salvar no Supabase também (mas não falhar se der erro)
      try {
        console.log('💾 [ProfileWizard] Tentando salvar no Supabase...');
        const supabaseClient = supabase as any;
        await supabaseClient
          .from('profiles')
          .update({
            nome: data.nome,
            idade: data.idade,
            peso: data.peso,
            altura: data.altura,
            sexo: data.sexo,
            objetivo: data.objetivo,
            nivel_atividade: data.nivel_atividade,
            tipo_dieta: data.tipo_dieta,
          })
          .eq('id', userId);
      } catch (supabaseError) {
        console.warn('⚠️ [ProfileWizard] Supabase não disponível (modo mock):', supabaseError);
      }

      toast({
        title: '🎉 Perfil configurado!',
        description: 'Vamos começar sua jornada nutricional',
      });

      console.log('🎯 [ProfileWizard] Chamando onComplete');
      onComplete(completeProfile);
    } catch (error) {
      console.error('💥 [ProfileWizard] Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar perfil',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🏁 [ProfileWizard] Submit finalizado');
    }
  };

  const nextStep = async () => {
    console.log('🔄 [ProfileWizard] Tentando avançar step');
    
    // Validar campos do step atual antes de avançar
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['nome', 'idade', 'peso', 'altura', 'sexo'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['objetivo', 'tipo_dieta'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['nivel_atividade'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    console.log('✅ [ProfileWizard] Validação step:', { currentStep, isValid, errors });
    
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: 'Preencha todos os campos',
        description: 'Por favor, complete as informações antes de continuar',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-[var(--shadow-card)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao NUTRIA!</CardTitle>
          <CardDescription className="text-base mt-2">
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.id
                        ? 'bg-primary border-primary text-white'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Como você gostaria de ser chamado?"
                    {...register('nome')}
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="idade">Idade (anos)</Label>
                    <Input
                      id="idade"
                      type="number"
                      placeholder="25"
                      {...register('idade')}
                    />
                    {errors.idade && (
                      <p className="text-sm text-destructive mt-1">{errors.idade.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      {...register('peso')}
                    />
                    {errors.peso && (
                      <p className="text-sm text-destructive mt-1">{errors.peso.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input
                      id="altura"
                      type="number"
                      placeholder="170"
                      {...register('altura')}
                    />
                    {errors.altura && (
                      <p className="text-sm text-destructive mt-1">{errors.altura.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Sexo</Label>
                  <RadioGroup
                    value={watchedValues.sexo}
                    onValueChange={(value) => setValue('sexo', value as Sexo)}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino" className="cursor-pointer">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="feminino" />
                      <Label htmlFor="feminino" className="cursor-pointer">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="outro" />
                      <Label htmlFor="outro" className="cursor-pointer">Outro</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Objetivos */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label>Qual é o seu objetivo?</Label>
                  <RadioGroup
                    value={watchedValues.objetivo}
                    onValueChange={(value) => setValue('objetivo', value as Objetivo)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
                  >
                    {[
                      { value: 'perder_peso', label: '🔥 Perder peso', desc: 'Reduzir gordura corporal' },
                      { value: 'ganhar_peso', label: '📈 Ganhar peso', desc: 'Aumentar massa total' },
                      { value: 'manter_peso', label: '⚖️ Manter peso', desc: 'Manutenção saudável' },
                      { value: 'ganhar_massa', label: '💪 Ganhar massa', desc: 'Hipertrofia muscular' },
                    ].map((objetivo) => (
                      <div key={objetivo.value} className="flex items-start space-x-2">
                        <RadioGroupItem value={objetivo.value} id={objetivo.value} className="mt-1" />
                        <Label htmlFor={objetivo.value} className="cursor-pointer flex-1">
                          <div className="font-medium">{objetivo.label}</div>
                          <div className="text-xs text-muted-foreground">{objetivo.desc}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Tipo de dieta preferida (pode escolher mais de uma)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'balanceada', label: '🍽️ Balanceada', desc: 'Variedade e equilíbrio' },
                      { value: 'low_carb', label: '🥑 Low Carb', desc: 'Poucos carboidratos' },
                      { value: 'keto', label: '🥓 Keto', desc: 'Muito baixo em carbs' },
                      { value: 'vegetariana', label: '🥗 Vegetariana', desc: 'Sem carne' },
                      { value: 'vegana', label: '🌱 Vegana', desc: 'Sem produtos animais' },
                      { value: 'paleo', label: '🦴 Paleo', desc: 'Alimentos naturais' },
                    ].map((dieta) => (
                      <div key={dieta.value} className="flex items-start space-x-2">
                        <Checkbox
                          id={dieta.value}
                          checked={watchedValues.tipo_dieta?.includes(dieta.value as TipoDieta)}
                          onCheckedChange={(checked) => {
                            const current = watchedValues.tipo_dieta || [];
                            if (checked) {
                              setValue('tipo_dieta', [...current, dieta.value as TipoDieta]);
                            } else {
                              setValue('tipo_dieta', current.filter((d) => d !== dieta.value) as TipoDietaArray);
                            }
                          }}
                        />
                        <Label htmlFor={dieta.value} className="cursor-pointer flex-1">
                          <div className="font-medium">{dieta.label}</div>
                          <div className="text-xs text-muted-foreground">{dieta.desc}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.tipo_dieta && (
                    <p className="text-sm text-destructive mt-1">{errors.tipo_dieta.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Estilo de Vida */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label>Nível de atividade física</Label>
                  <RadioGroup
                    value={watchedValues.nivel_atividade}
                    onValueChange={(value) => setValue('nivel_atividade', value as NivelAtividade)}
                    className="grid grid-cols-1 gap-3 mt-2"
                  >
                    {[
                      { value: 'sedentario', label: '😴 Sedentário', desc: 'Pouco ou nenhum exercício' },
                      { value: 'leve', label: '🚶 Levemente ativo', desc: 'Exercício leve 1-3x/semana' },
                      { value: 'moderado', label: '🏃 Moderadamente ativo', desc: 'Exercício moderado 3-5x/semana' },
                      { value: 'intenso', label: '🏋️ Muito ativo', desc: 'Exercício intenso 6-7x/semana' },
                      { value: 'muito_intenso', label: '🔥 Extremamente ativo', desc: 'Exercício intenso diário + trabalho físico' },
                    ].map((atividade) => (
                      <div key={atividade.value} className="flex items-start space-x-2">
                        <RadioGroupItem value={atividade.value} id={atividade.value} className="mt-1" />
                        <Label htmlFor={atividade.value} className="cursor-pointer flex-1">
                          <div className="font-medium">{atividade.label}</div>
                          <div className="text-xs text-muted-foreground">{atividade.desc}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    console.log('🎯 [ProfileWizard] Botão Finalizar clicado');
                    console.log('📋 [ProfileWizard] Erros atuais:', errors);
                    const isValid = await trigger();
                    console.log('✅ [ProfileWizard] Formulário válido?', isValid);
                    if (isValid) {
                      handleSubmit(onSubmit)();
                    } else {
                      console.error('❌ [ProfileWizard] Formulário inválido:', errors);
                      toast({
                        title: 'Formulário incompleto',
                        description: 'Por favor, verifique todos os campos',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  {loading ? 'Salvando...' : 'Finalizar'}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
