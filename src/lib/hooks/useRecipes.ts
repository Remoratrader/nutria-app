import { useState, useEffect } from 'react';
import type { Recipe } from '@/types/nutrition';
import { recipes as recipesData } from '@/data/ecipes';

const categories = ['Todos', 'Café da Manhã', 'Brasileiro', 'Mexicana', 'Fitness', 'Mediterrânea', 'Italiana', 'Francesa', 'Árabe', 'Fast Food', 'Asiático', 'Vegana', 'Sobremesa Saudável', 'Inovadora'];

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const normalizedRecipes = recipesData.map(r => ({
      ...r,
      nome: r.name,
      categoria: r.category,
      calorias: r.calories,
      tempo_preparo: r.prepTime,
      tempo_cozimento: 0,
      emoji: r.image,
      ingredientes: r.ingredients,
      modo_preparo: r.instructions,
      tags: [r.category, r.cuisine],
      proteinas: r.macros.protein,
      carboidratos: r.macros.carbs,
      gorduras: r.macros.fat,
    })) as Recipe[];
    
    setRecipes(normalizedRecipes);
    setIsLoading(false);
  }, []);

  return {
    recipes,
    loading: isLoading,
    isLoading,
    categories,
    searchRecipes: (query: string) => {
      return recipes.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase()))
      );
    },
    filterByCategory: (category: string) => {
      if (category === 'Todos') return recipes;
      return recipes.filter(r => r.category === category || r.cuisine === category);
    },
  };
};
