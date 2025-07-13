'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Leaf, ShoppingCart, User, UtensilsCrossed, Heart, ArrowLeft, Send, Bot, Sparkles, LoaderCircle, Droplets, Coffee, Package, Sandwich, MinusCircle, PlusCircle, BookOpen, ChevronDown } from 'lucide-react';

// --- INTERFACES E TIPOS ATUALIZADOS ---
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: number | string;
  name: string;
  category: 'Brasileiro' | 'Asiático' | 'Fitness' | 'Mediterrânea' | 'Vegana' | 'Italiana' | 'Francesa' | 'Árabe' | 'Fast Food' | 'Inovadora';
  icon: string; // Emoji para a receita
  calories: number;
  ingredients: Ingredient[];
  price?: number;
  instructions?: string;
}

interface UserProfile {
  weight: string;
  height: string;
  age: string;
  gender: 'male' | 'female';
  activityLevel: number;
  wantsSnacks: boolean;
  wantsInnovative: boolean;
}

type View = 'welcome' | 'profile' | 'recommendations' | 'menu' | 'shopping' | 'aiMenu';

// --- DADOS MOCKADOS (TOTAL: 52 RECEITAS) ---
const recipesData: Recipe[] = [
    // Brasileiro (6)
    { id: 1, name: 'Feijoada Leve', category: 'Brasileiro', icon: '🍲', calories: 650, ingredients: [{ name: 'Feijão Preto', quantity: 200, unit: 'g' }, { name: 'Carne Seca', quantity: 100, unit: 'g' }, { name: 'Couve', quantity: 50, unit: 'g' }], price: 30.00, instructions: "Cozinhe o feijão com a carne dessalgada. Refogue a couve." },
    { id: 2, name: 'Moqueca de Banana da Terra', category: 'Brasileiro', icon: '🍌', calories: 500, ingredients: [{ name: 'Banana da Terra', quantity: 2, unit: 'un' }, { name: 'Leite de Coco', quantity: 200, unit: 'ml' }, { name: 'Azeite de Dendê', quantity: 20, unit: 'ml' }], price: 27.00, instructions: "Refogue os temperos, adicione a banana e o leite de coco, cozinhe até amaciar." },
    { id: 3, name: 'Vaca Atolada', category: 'Brasileiro', icon: '🐄', calories: 700, ingredients: [{ name: 'Costela Bovina', quantity: 200, unit: 'g' }, { name: 'Mandioca', quantity: 150, unit: 'g' }, { name: 'Tomate', quantity: 1, unit: 'un' }], price: 32.00, instructions: "Cozinhe a costela na pressão. Adicione a mandioca e cozinhe até ficar macia." },
    { id: 4, name: 'Pão de Queijo', category: 'Brasileiro', icon: '🧀', calories: 150, ingredients: [{ name: 'Polvilho Doce', quantity: 100, unit: 'g' }, { name: 'Queijo Minas', quantity: 50, unit: 'g' }, { name: 'Ovo', quantity: 1, unit: 'un' }], price: 8.00, instructions: "Misture todos os ingredientes, faça bolinhas e asse até dourar." },
    { id: 21, name: 'Galinhada', category: 'Brasileiro', icon: '🐔', calories: 580, ingredients: [{ name: 'Frango em pedaços', quantity: 200, unit: 'g' }, { name: 'Arroz', quantity: 100, unit: 'g' }, { name: 'Açafrão', quantity: 5, unit: 'g' }], price: 26.00, instructions: "Refogue o frango com temperos, adicione o arroz e açafrão, e cozinhe." },
    { id: 35, name: 'Escondidinho de Carne Seca', category: 'Brasileiro', icon: '🥔', calories: 620, ingredients: [{ name: 'Mandioca', quantity: 300, unit: 'g' }, { name: 'Carne Seca Desfiada', quantity: 150, unit: 'g' }, { name: 'Queijo Coalho', quantity: 50, unit: 'g' }], price: 33.00, instructions: "Faça um purê com a mandioca. Refogue a carne seca. Monte em camadas e gratine com o queijo." },
    // Fitness (6)
    { id: 5, name: 'Frango Grelhado com Batata Doce', category: 'Fitness', icon: '💪', calories: 450, ingredients: [{ name: 'Filé de Frango', quantity: 150, unit: 'g' }, { name: 'Batata Doce', quantity: 200, unit: 'g' }, { name: 'Brócolis', quantity: 100, unit: 'g' }], price: 25.00, instructions: "Grelhe o frango. Cozinhe a batata doce e o brócolis no vapor." },
    { id: 6, name: 'Omelete com Queijo e Tomate', category: 'Fitness', icon: '🥚', calories: 350, ingredients: [{ name: 'Ovo', quantity: 3, unit: 'un' }, { name: 'Queijo Minas', quantity: 50, unit: 'g' }, { name: 'Tomate', quantity: 1, unit: 'un' }], price: 20.00, instructions: "Bata os ovos, adicione o queijo e tomate picado, e cozinhe na frigideira." },
    { id: 7, name: 'Wrap de Alface com Carne Moída', category: 'Fitness', icon: '🥬', calories: 400, ingredients: [{ name: 'Folhas de Alface Grandes', quantity: 4, unit: 'un' }, { name: 'Carne Moída (Patinho)', quantity: 150, unit: 'g' }, { name: 'Cenoura Ralada', quantity: 50, unit: 'g' }], price: 22.00, instructions: "Refogue a carne moída com temperos. Sirva dentro das folhas de alface." },
    { id: 8, name: 'Crepioca com Cottage', category: 'Fitness', icon: '🥞', calories: 380, ingredients: [{ name: 'Goma de Tapioca', quantity: 3, unit: 'colheres de sopa' }, { name: 'Ovo', quantity: 1, unit: 'un' }, { name: 'Queijo Cottage', quantity: 50, unit: 'g' }], price: 18.00, instructions: "Misture a goma e o ovo, despeje na frigideira. Recheie com o cottage." },
    { id: 22, name: 'Salada de Quinoa com Abacate', category: 'Fitness', icon: '🥑', calories: 420, ingredients: [{ name: 'Quinoa Cozida', quantity: 100, unit: 'g' }, { name: 'Abacate', quantity: 0.5, unit: 'un' }, { name: 'Tomate Cereja', quantity: 50, unit: 'g' }], price: 28.00, instructions: "Misture a quinoa, o abacate em cubos e os tomates. Tempere com limão." },
    { id: 36, name: 'Shake de Proteína com Banana', category: 'Inovadora', icon: '🥤', calories: 300, ingredients: [{ name: 'Whey Protein', quantity: 30, unit: 'g' }, { name: 'Banana Congelada', quantity: 1, unit: 'un' }, { name: 'Leite Desnatado', quantity: 200, unit: 'ml' }], price: 15.00, instructions: "Bata todos os ingredientes no liquidificador até ficar homogêneo." },
    // Mediterrânea (5)
    { id: 9, name: 'Salmão Grelhado com Aspargos', category: 'Mediterrânea', icon: '🐟', calories: 520, ingredients: [{ name: 'Salmão', quantity: 150, unit: 'g' }, { name: 'Aspargos Frescos', quantity: 100, unit: 'g' }, { name: 'Azeite de Oliva', quantity: 15, unit: 'ml' }], price: 38.00, instructions: "Tempere o salmão e os aspargos com azeite, sal e pimenta. Grelhe ou asse." },
    { id: 10, name: 'Salada Grega', category: 'Mediterrânea', icon: '🥗', calories: 300, ingredients: [{ name: 'Pepino', quantity: 1, unit: 'un' }, { name: 'Tomate', quantity: 2, unit: 'un' }, { name: 'Queijo Feta', quantity: 50, unit: 'g' }], price: 28.00, instructions: "Corte os vegetais, adicione o queijo e tempere com azeite e orégano." },
    { id: 11, name: 'Frango ao Limão e Ervas', category: 'Mediterrânea', icon: '🍋', calories: 480, ingredients: [{ name: 'Filé de Frango', quantity: 150, unit: 'g' }, { name: 'Limão Siciliano', quantity: 1, unit: 'un' }, { name: 'Alecrim', quantity: 1, unit: 'ramo' }], price: 26.00, instructions: "Tempere o frango com suco de limão, alecrim e sal. Grelhe ou asse." },
    { id: 12, name: 'Massa com Pesto e Tomate Cereja', category: 'Mediterrânea', icon: '🍝', calories: 600, ingredients: [{ name: 'Massa Integral', quantity: 100, unit: 'g' }, { name: 'Molho Pesto', quantity: 30, unit: 'g' }, { name: 'Tomate Cereja', quantity: 80, unit: 'g' }], price: 29.00, instructions: "Cozinhe a massa, misture com o pesto e os tomates cortados ao meio." },
    { id: 23, name: 'Sopa de Lentilha', category: 'Mediterrânea', icon: '🥣', calories: 350, ingredients: [{ name: 'Lentilha', quantity: 100, unit: 'g' }, { name: 'Caldo de Legumes', quantity: 500, unit: 'ml' }, { name: 'Cenoura', quantity: 1, unit: 'un' }], price: 20.00, instructions: "Cozinhe a lentilha com os legumes no caldo até ficarem macios." },
    // Asiático (5)
    { id: 13, name: 'Yakisoba de Carne', category: 'Asiático', icon: '🍜', calories: 600, ingredients: [{ name: 'Macarrão para Yakisoba', quantity: 150, unit: 'g' }, { name: 'Carne em Tiras', quantity: 100, unit: 'g' }, { name: 'Mix de Legumes', quantity: 150, unit: 'g' }], price: 28.00, instructions: "Frite a carne, adicione os legumes e o macarrão cozido com o molho." },
    { id: 14, name: 'Sushi (Combo 10 peças)', category: 'Asiático', icon: '🍣', calories: 380, ingredients: [{ name: 'Arroz de Sushi', quantity: 150, unit: 'g' }, { name: 'Salmão', quantity: 80, unit: 'g' }, { name: 'Alga Nori', quantity: 10, unit: 'g' }], price: 40.00, instructions: "Monte os sushis com os ingredientes." },
    { id: 15, name: 'Frango Xadrez', category: 'Asiático', icon: '🥡', calories: 550, ingredients: [{ name: 'Frango em cubos', quantity: 150, unit: 'g' }, { name: 'Pimentão', quantity: 1, unit: 'un' }, { name: 'Amendoim', quantity: 30, unit: 'g' }], price: 27.00, instructions: "Frite o frango, adicione os pimentões e finalize com o molho shoyu e amendoim." },
    { id: 16, name: 'Rolinho Primavera (2 un)', category: 'Asiático', icon: '🫔', calories: 250, ingredients: [{ name: 'Massa para rolinho', quantity: 2, unit: 'un' }, { name: 'Repolho', quantity: 50, unit: 'g' }, { name: 'Carne moída', quantity: 50, unit: 'g' }], price: 15.00, instructions: "Recheie a massa com o refogado de carne e repolho e frite." },
    { id: 37, name: 'Pad Thai', category: 'Asiático', icon: '🍤', calories: 650, ingredients: [{ name: 'Talharim de Arroz', quantity: 100, unit: 'g' }, { name: 'Camarão', quantity: 100, unit: 'g' }, { name: 'Amendoim', quantity: 20, unit: 'g' }], price: 39.00, instructions: "Salteie o camarão, adicione o macarrão cozido e o molho. Finalize com amendoim." },
    // Vegana (6)
    { id: 17, name: 'Strogonoff de Palmito', category: 'Vegana', icon: '🌴', calories: 450, ingredients: [{ name: 'Palmito Pupunha', quantity: 200, unit: 'g' }, { name: 'Creme de Leite de Castanha', quantity: 100, unit: 'g' }, { name: 'Champignon', quantity: 50, unit: 'g' }], price: 33.00, instructions: "Refogue o palmito e champignon, adicione o creme de castanha e temperos." },
    { id: 18, name: 'Bobó de Grão de Bico', category: 'Vegana', icon: '🥣', calories: 520, ingredients: [{ name: 'Grão de Bico', quantity: 150, unit: 'g' }, { name: 'Mandioca', quantity: 100, unit: 'g' }, { name: 'Leite de Coco', quantity: 100, unit: 'ml' }], price: 29.00, instructions: "Cozinhe o grão de bico. Bata a mandioca cozida com leite de coco para o creme. Misture." },
    { id: 19, name: 'Hambúrguer de Lentilha', category: 'Vegana', icon: '🍔', calories: 480, ingredients: [{ name: 'Lentilha Cozida', quantity: 150, unit: 'g' }, { name: 'Farinha de Aveia', quantity: 50, unit: 'g' }, { name: 'Cebola', quantity: 0.5, unit: 'un' }], price: 25.00, instructions: "Processe a lentilha com os temperos, molde o hambúrguer com a aveia e grelhe." },
    { id: 20, name: 'Tofu Grelhado com Legumes', category: 'Vegana', icon: '🥢', calories: 400, ingredients: [{ name: 'Tofu Firme', quantity: 150, unit: 'g' }, { name: 'Brócolis', quantity: 80, unit: 'g' }, { name: 'Molho Shoyu', quantity: 20, unit: 'ml' }], price: 24.00, instructions: "Grelhe o tofu fatiado com shoyu. Salteie os legumes." },
    { id: 24, name: 'Curry de Legumes', category: 'Vegana', icon: '🍛', calories: 470, ingredients: [{ name: 'Mix de Legumes', quantity: 200, unit: 'g' }, { name: 'Leite de Coco', quantity: 150, unit: 'ml' }, { name: 'Pó de Curry', quantity: 10, unit: 'g' }], price: 28.00, instructions: "Refogue os legumes, adicione o curry e o leite de coco, e cozinhe." },
    { id: 38, name: 'Macarrão de Abobrinha ao Pesto', category: 'Vegana', icon: ' zucchini', calories: 350, ingredients: [{ name: 'Abobrinha', quantity: 2, unit: 'un' }, { name: 'Molho Pesto Vegano', quantity: 50, unit: 'g' }, { name: 'Nozes', quantity: 20, unit: 'g' }], price: 27.00, instructions: "Faça espirais de abobrinha para o 'macarrão'. Misture com o pesto e salpique nozes." },
    // Italiana (5)
    { id: 25, name: 'Lasanha à Bolonhesa', category: 'Italiana', icon: '🍝', calories: 700, ingredients: [{ name: 'Massa de Lasanha', quantity: 100, unit: 'g' }, { name: 'Carne Moída', quantity: 150, unit: 'g' }, { name: 'Molho de Tomate', quantity: 200, unit: 'ml' }], price: 35.00, instructions: "Monte camadas de massa, molho bolonhesa e queijo. Asse." },
    { id: 26, name: 'Risoto de Cogumelos', category: 'Italiana', icon: '🍄', calories: 550, ingredients: [{ name: 'Arroz Arbóreo', quantity: 100, unit: 'g' }, { name: 'Cogumelo Funghi', quantity: 50, unit: 'g' }, { name: 'Vinho Branco', quantity: 50, unit: 'ml' }], price: 38.00, instructions: "Refogue o arroz, adicione o vinho, e vá adicionando caldo aos poucos. Junte os cogumelos." },
    { id: 27, name: 'Bruschetta de Tomate', category: 'Italiana', icon: '🍅', calories: 250, ingredients: [{ name: 'Pão Italiano', quantity: 2, unit: 'fatias' }, { name: 'Tomate', quantity: 1, unit: 'un' }, { name: 'Manjericão', quantity: 5, unit: 'g' }], price: 18.00, instructions: "Torre o pão, cubra com tomate picado, manjericão e azeite." },
    { id: 28, name: 'Pizza Margherita', category: 'Italiana', icon: '🍕', calories: 800, ingredients: [{ name: 'Massa de Pizza', quantity: 1, unit: 'un' }, { name: 'Molho de Tomate', quantity: 100, unit: 'ml' }, { name: 'Muçarela', quantity: 150, unit: 'g' }], price: 40.00, instructions: "Abra a massa, espalhe o molho, cubra com queijo e manjericão. Asse." },
    { id: 29, name: 'Polenta com Ragu', category: 'Italiana', icon: '🌽', calories: 600, ingredients: [{ name: 'Fubá para Polenta', quantity: 100, unit: 'g' }, { name: 'Linguiça Toscana', quantity: 100, unit: 'g' }, { name: 'Molho de Tomate', quantity: 150, unit: 'ml' }], price: 30.00, instructions: "Prepare a polenta. Faça um ragu com a linguiça e o molho. Sirva por cima." },
    // Francesa (5)
    { id: 30, name: 'Ratatouille', category: 'Francesa', icon: '🍆', calories: 300, ingredients: [{ name: 'Berinjela', quantity: 1, unit: 'un' }, { name: 'Abobrinha', quantity: 1, unit: 'un' }, { name: 'Pimentão', quantity: 1, unit: 'un' }], price: 28.00, instructions: "Fatie os legumes e monte em camadas com molho de tomate. Asse lentamente." },
    { id: 31, name: 'Boeuf Bourguignon', category: 'Francesa', icon: '🍷', calories: 600, ingredients: [{ name: 'Carne em cubos', quantity: 200, unit: 'g' }, { name: 'Vinho Tinto', quantity: 150, unit: 'ml' }, { name: 'Cebola', quantity: 1, unit: 'un' }], price: 45.00, instructions: "Marine a carne no vinho. Cozinhe lentamente com legumes até ficar macia." },
    { id: 32, name: 'Sopa de Cebola', category: 'Francesa', icon: '🧅', calories: 400, ingredients: [{ name: 'Cebola', quantity: 3, unit: 'un' }, { name: 'Caldo de Carne', quantity: 500, unit: 'ml' }, { name: 'Queijo Gruyère', quantity: 50, unit: 'g' }], price: 25.00, instructions: "Caramelize as cebolas, adicione o caldo e cozinhe. Sirva com pão e queijo gratinado." },
    { id: 33, name: 'Quiche Lorraine', category: 'Francesa', icon: '🥧', calories: 500, ingredients: [{ name: 'Massa de Torta', quantity: 1, unit: 'un' }, { name: 'Bacon', quantity: 100, unit: 'g' }, { name: 'Creme de Leite', quantity: 200, unit: 'ml' }], price: 30.00, instructions: "Forre uma forma com a massa, recheie com bacon, ovos e creme. Asse." },
    { id: 34, name: 'Croque Monsieur', category: 'Francesa', icon: '🥪', calories: 550, ingredients: [{ name: 'Pão de Forma', quantity: 2, unit: 'fatias' }, { name: 'Presunto', quantity: 50, unit: 'g' }, { name: 'Queijo Gruyère', quantity: 50, unit: 'g' }], price: 22.00, instructions: "Monte um sanduíche com presunto e queijo, cubra com molho bechamel e mais queijo, e gratine." },
    // Árabe (4)
    { id: 39, name: 'Kibe Assado', category: 'Árabe', icon: '🧆', calories: 450, ingredients: [{ name: 'Trigo para Kibe', quantity: 100, unit: 'g' }, { name: 'Carne Moída', quantity: 150, unit: 'g' }, { name: 'Hortelã', quantity: 10, unit: 'g' }], price: 28.00, instructions: "Hidrate o trigo, misture com a carne moída e hortelã. Asse até dourar." },
    { id: 40, name: 'Esfiha Aberta de Carne', category: 'Árabe', icon: '🍕', calories: 350, ingredients: [{ name: 'Massa de Esfiha', quantity: 1, unit: 'un' }, { name: 'Carne Moída', quantity: 80, unit: 'g' }, { name: 'Tomate', quantity: 0.5, unit: 'un' }], price: 12.00, instructions: "Abra a massa, cubra com a carne temperada e asse em forno alto." },
    { id: 41, name: 'Tabule', category: 'Árabe', icon: '🌿', calories: 250, ingredients: [{ name: 'Trigo para Kibe', quantity: 50, unit: 'g' }, { name: 'Salsinha', quantity: 30, unit: 'g' }, { name: 'Tomate', quantity: 1, unit: 'un' }], price: 20.00, instructions: "Hidrate o trigo e misture com muita salsinha, tomate, cebola e pepino picados. Tempere." },
    { id: 42, name: 'Homus com Pão Sírio', category: 'Árabe', icon: '🫓', calories: 400, ingredients: [{ name: 'Grão de Bico Cozido', quantity: 150, unit: 'g' }, { name: 'Tahine', quantity: 30, unit: 'g' }, { name: 'Pão Sírio', quantity: 1, unit: 'un' }], price: 22.00, instructions: "Bata o grão de bico com tahine, limão e alho. Sirva com o pão." },
    // Fast Food (Saudável) (4)
    { id: 43, name: 'Hambúrguer Caseiro na Grelha', category: 'Fast Food', icon: '🍔', calories: 600, ingredients: [{ name: 'Pão de Hambúrguer Integral', quantity: 1, unit: 'un' }, { name: 'Carne Moída (Patinho)', quantity: 150, unit: 'g' }, { name: 'Alface e Tomate', quantity: 1, unit: 'a gosto' }], price: 25.00, instructions: "Molde e grelhe o hambúrguer. Monte o sanduíche com salada." },
    { id: 44, name: 'Pizza de Frigideira', category: 'Fast Food', icon: '🍕', calories: 550, ingredients: [{ name: 'Massa de Rap10', quantity: 1, unit: 'un' }, { name: 'Molho de Tomate', quantity: 50, unit: 'ml' }, { name: 'Queijo Muçarela', quantity: 80, unit: 'g' }], price: 20.00, instructions: "Aqueça a massa na frigideira, adicione molho e queijo, tampe para derreter." },
    { id: 45, name: 'Batata Rústica Assada', category: 'Fast Food', icon: '🍟', calories: 350, ingredients: [{ name: 'Batata Inglesa', quantity: 200, unit: 'g' }, { name: 'Azeite', quantity: 15, unit: 'ml' }, { name: 'Páprica', quantity: 5, unit: 'g' }], price: 15.00, instructions: "Corte as batatas em gomos, tempere com azeite e páprica, e asse até dourar." },
    { id: 46, name: 'Tacos de Frango', category: 'Fast Food', icon: '🌮', calories: 480, ingredients: [{ name: 'Massa de Taco', quantity: 2, unit: 'un' }, { name: 'Frango Desfiado', quantity: 100, unit: 'g' }, { name: 'Abacate', quantity: 50, unit: 'g' }], price: 26.00, instructions: "Aqueça as massas de taco. Recheie com frango e guacamole (abacate amassado)." },
    // Inovadora (2)
    { id: 47, name: 'Mousse de Whey com Morango', category: 'Inovadora', icon: '🍓', calories: 250, ingredients: [{ name: 'Whey Protein Baunilha', quantity: 30, unit: 'g' }, { name: 'Morangos Congelados', quantity: 100, unit: 'g' }, { name: 'Iogurte Grego', quantity: 50, unit: 'g' }], price: 20.00, instructions: "Bata todos os ingredientes no processador até obter uma consistência de mousse." },
    { id: 48, name: 'Panqueca de Whey e Aveia', category: 'Inovadora', icon: '🥞', calories: 350, ingredients: [{ name: 'Whey Protein Chocolate', quantity: 30, unit: 'g' }, { name: 'Farinha de Aveia', quantity: 50, unit: 'g' }, { name: 'Ovo', quantity: 1, unit: 'un' }], price: 18.00, instructions: "Misture todos os ingredientes com um pouco de água ou leite até formar uma massa. Despeje na frigideira quente." },
];


// --- COMPONENTES FILHOS ---

const ProfileForm: React.FC<{ userProfile: UserProfile; setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>; onProfileComplete: () => void; }> = ({ userProfile, setUserProfile, onProfileComplete }) => {
  // CORREÇÃO: Função de handleChange agora é 100% type-safe
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;

    // Primeiro, verificamos se o elemento é um input e do tipo checkbox
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      // Se for, sabemos que a propriedade 'checked' existe e a usamos
      setUserProfile(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      // Para todos os outros casos (inputs de texto, selects), usamos a propriedade 'value'
      setUserProfile(prev => ({ ...prev, [name]: e.target.value }));
    }
  };
  const isFormValid = userProfile.weight && userProfile.height && userProfile.age;
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg animate-fade-in">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-3xl font-bold text-gray-800">Seu Perfil</h2>
        <p className="mt-2 text-gray-500">Preencha para receber recomendações.</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if(isFormValid) onProfileComplete(); }}>
         <div>
          <label htmlFor="weight" className="text-sm font-medium text-gray-700">Peso (kg)</label>
          <input type="number" name="weight" id="weight" value={userProfile.weight} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder:text-gray-400" placeholder="Ex: 70" />
        </div>
        <div>
          <label htmlFor="height" className="text-sm font-medium text-gray-700">Altura (cm)</label>
          <input type="number" name="height" id="height" value={userProfile.height} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder:text-gray-400" placeholder="Ex: 175" />
        </div>
        <div>
          <label htmlFor="age" className="text-sm font-medium text-gray-700">Idade</label>
          <input type="number" name="age" id="age" value={userProfile.age} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder:text-gray-400" placeholder="Ex: 30" />
        </div>
        <div>
          <label htmlFor="gender" className="text-sm font-medium text-gray-700">Gênero</label>
          <select name="gender" id="gender" value={userProfile.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>
        <div>
          <label htmlFor="activityLevel" className="text-sm font-medium text-gray-700">Nível de Atividade</label>
          <select name="activityLevel" id="activityLevel" value={userProfile.activityLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900">
            <option value={1.2}>Sedentário</option>
            <option value={1.375}>Levemente ativo</option>
            <option value={1.55}>Moderadamente ativo</option>
            <option value={1.725}>Muito ativo</option>
            <option value={1.9}>Extremamente ativo</option>
          </select>
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <input type="checkbox" name="wantsSnacks" id="wantsSnacks" checked={userProfile.wantsSnacks} onChange={handleChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="wantsSnacks" className="ml-2 block text-sm text-gray-900">Desejo incluir lanches saudáveis</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" name="wantsInnovative" id="wantsInnovative" checked={userProfile.wantsInnovative} onChange={handleChange} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <label htmlFor="wantsInnovative" className="ml-2 block text-sm text-gray-900">Quero receitas inovadoras (ex: com suplementos)</label>
            </div>
        </div>
        <button type="submit" disabled={!isFormValid} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
          <Heart className="h-5 w-5 mr-2"/> Ver Recomendações
        </button>
      </form>
    </div>
  );
};

const AIMenuGenerator: React.FC<{
  setAiGeneratedMeals: React.Dispatch<React.SetStateAction<Recipe[]>>;
  updateMealCount: (recipe: Recipe, delta: number) => void;
  setCurrentView: React.Dispatch<React.SetStateAction<View>>;
  dailyCalories: number;
}> = ({ setAiGeneratedMeals, updateMealCount, setCurrentView, dailyCalories }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Por favor, descreva o que você precisa.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, dailyCalories }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao se comunicar com a IA.');
      }

      const generatedRecipes = await response.json();
      
      const recipesWithIds = generatedRecipes.map((recipe: Omit<Recipe, 'id'>) => ({
        ...recipe,
        id: `ai-${crypto.randomUUID()}`
      }));

      setAiGeneratedMeals(recipesWithIds);
      recipesWithIds.forEach((recipe: Recipe) => updateMealCount(recipe, 1));
      setCurrentView('shopping');

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      console.error(e);
      setError(`Ocorreu um erro ao gerar o cardápio. Detalhes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-lg animate-fade-in">
      <div className="text-center">
        <Bot className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-3xl font-bold text-gray-800">Chef com IA</h2>
        <p className="mt-2 text-gray-500">Descreva o cardápio que você deseja.</p>
        <p className="mt-1 text-xs text-gray-400">Ex: &apos;Um plano semanal com 5 jantares e 3 almoços, low carb&apos;</p>
      </div>
      <div className="space-y-4">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-28 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900" placeholder="Eu preciso de..." />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
          {isLoading ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          {isLoading ? 'Gerando...' : 'Gerar Cardápio e Lista de Compras'}
        </button>
        <button onClick={() => setCurrentView('welcome')} className="mt-2 w-full flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Início
        </button>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL (Orquestrador) ---
export default function NutriApp() {
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({ weight: '70', height: '175', age: '30', gender: 'male', activityLevel: 1.55, wantsSnacks: false, wantsInnovative: false });
  const [selectedMeals, setSelectedMeals] = useState<Map<string | number, number>>(new Map());
  const [aiGeneratedMeals, setAiGeneratedMeals] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const allRecipes = useMemo(() => [...recipesData, ...aiGeneratedMeals], [aiGeneratedMeals]);

  const dailyCalories = useMemo(() => {
    const { weight, height, age, gender, activityLevel } = userProfile;
    if (!weight || !height || !age) return 2000;
    const [weightKg, heightCm, ageYears] = [parseFloat(weight), parseFloat(height), parseInt(age)];
    const bmr = gender === 'male'
      ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears)
      : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
    return Math.round(bmr * activityLevel);
  }, [userProfile]);
  
  const waterIntake = useMemo(() => {
      if (!userProfile.weight) return 2;
      const weightKg = parseFloat(userProfile.weight);
      const baseIntake = weightKg * 35;
      const activityBonus = userProfile.activityLevel > 1.6 ? 500 : 0;
      return parseFloat(((baseIntake + activityBonus) / 1000).toFixed(1));
  }, [userProfile.weight, userProfile.activityLevel]);

  const updateMealCount = useCallback((recipe: Recipe, delta: number) => {
    setSelectedMeals(prevMap => {
        const newMap = new Map(prevMap);
        const currentCount = newMap.get(recipe.id) || 0;
        const newCount = currentCount + delta;

        if (newCount > 0) {
            newMap.set(recipe.id, newCount);
        } else {
            newMap.delete(recipe.id);
        }
        if (!recipesData.some(r => r.id === recipe.id) && !aiGeneratedMeals.some(r => r.id === recipe.id)) {
            setAiGeneratedMeals(prevAi => [...prevAi, recipe]);
        }
        return newMap;
    });
  }, [aiGeneratedMeals]);

  const shoppingList = useMemo(() => {
    const consolidated = new Map<string, { quantity: number; unit: string }>();
    selectedMeals.forEach((count, recipeId) => {
        const recipe = allRecipes.find(r => r.id === recipeId);
        if (recipe) {
            recipe.ingredients.forEach(ing => {
                const existing = consolidated.get(ing.name);
                const totalQuantity = ing.quantity * count;
                if (existing && existing.unit === ing.unit) {
                    existing.quantity += totalQuantity;
                } else {
                    consolidated.set(ing.name, { quantity: totalQuantity, unit: ing.unit });
                }
            });
        }
    });
    return Array.from(consolidated.entries()).map(([name, data]) => ({ name, ...data }));
  }, [selectedMeals, allRecipes]);

  const filteredRecipes = useMemo(() => {
    let recipes = recipesData;
    if (!userProfile.wantsInnovative) {
        recipes = recipes.filter(r => r.category !== 'Inovadora');
    }
    if (selectedCategory === 'Todos') return recipes;
    return recipes.filter(recipe => recipe.category === selectedCategory);
  }, [selectedCategory, userProfile.wantsInnovative]);

  const formatShoppingListForWhatsApp = () => {
    const header = `🛒 Sua Lista de Compras - NutrIA\n\n`;
    const items = shoppingList.map(item => `• ${item.name}: ${item.quantity}${item.unit}`).join('\n');
    const fullText = header + items;
    return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  };
  
  const renderView = () => {
    const baseCategories: Recipe['category'][] = ['Brasileiro', 'Fitness', 'Mediterrânea', 'Italiana', 'Francesa', 'Árabe', 'Fast Food', 'Asiático', 'Vegana'];
    const categories = userProfile.wantsInnovative ? [...baseCategories, 'Inovadora'] : baseCategories;
    
    switch (currentView) {
      case 'profile':
        return <ProfileForm userProfile={userProfile} setUserProfile={setUserProfile} onProfileComplete={() => setCurrentView('recommendations')} />;
      
      case 'recommendations':
        return (
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="text-center mb-6">
                <Heart className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-3xl font-bold text-gray-800">Suas Recomendações</h2>
            </div>
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-800">Meta Calórica Diária</p>
                    <p className="text-4xl font-extrabold text-blue-600">{dailyCalories} <span className="text-2xl">kcal</span></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-cyan-50 rounded-lg"><div className="flex items-center mb-2"><Droplets className="h-6 w-6 text-cyan-600 mr-2"/><h3 className="font-bold text-cyan-800">Hidratação</h3></div><p className="text-cyan-700">Beba pelo menos <span className="font-bold">{waterIntake} litros</span> de água por dia.</p></div>
                    <div className="p-4 bg-yellow-50 rounded-lg"><div className="flex items-center mb-2"><Coffee className="h-6 w-6 text-yellow-700 mr-2"/><h3 className="font-bold text-yellow-800">Café</h3></div><p className="text-yellow-700">Evite mais de <span className="font-bold">2-3 xícaras</span> para um sono melhor.</p></div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg"><div className="flex items-center mb-2"><Package className="h-6 w-6 text-purple-600 mr-2"/><h3 className="font-bold text-purple-800">Suplementos</h3></div><p className="text-sm text-purple-700">O uso de Whey, Creatina e outros deve ser orientado por um médico ou nutricionista.</p></div>
                {userProfile.wantsSnacks && (<div className="p-4 bg-green-50 rounded-lg text-green-800 flex items-center"><Sandwich className="h-5 w-5 mr-3"/><p className="text-sm font-medium">Opção de lanches saudáveis foi incluída no seu plano.</p></div>)}
            </div>
            <div className="mt-8 space-y-3">
                <button onClick={() => setCurrentView('menu')} className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"><UtensilsCrossed className="h-5 w-5 mr-2" /> Ver Cardápio Manual</button>
                <button onClick={() => setCurrentView('aiMenu')} className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"><Bot className="h-5 w-5 mr-2" /> Criar Cardápio com IA</button>
            </div>
          </div>
        );

      case 'aiMenu':
        return <AIMenuGenerator setAiGeneratedMeals={setAiGeneratedMeals} updateMealCount={updateMealCount} setCurrentView={setCurrentView} dailyCalories={dailyCalories} />;
      
      case 'menu':
        const totalCalories = Array.from(selectedMeals.entries()).reduce((acc, [recipeId, count]) => {
            const recipe = allRecipes.find(r => r.id === recipeId);
            return acc + (recipe ? recipe.calories * count : 0);
        }, 0);
        return (
          <div className="w-full max-w-6xl p-4 sm:p-6 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div><h2 className="text-3xl font-bold text-gray-800">Monte seu Cardápio</h2><p className="text-gray-500">Adicione ou remova refeições para a sua semana.</p></div>
              <button onClick={() => setCurrentView('recommendations')} className="mt-2 sm:mt-0 flex items-center text-sm font-medium text-green-600 hover:text-green-800"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Todos', ...categories].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-2">
              {filteredRecipes.map(recipe => {
                const count = selectedMeals.get(recipe.id) || 0;
                return (
                    <div key={recipe.id} className={`p-4 rounded-lg transition-all flex flex-col justify-between ${count > 0 ? 'ring-2 ring-green-500 bg-green-50' : 'bg-gray-100'}`}>
                        <div>
                            <h3 className="font-bold text-gray-800"><span className="mr-2">{recipe.icon}</span>{recipe.name}</h3>
                            <p className="text-sm text-gray-600">{recipe.calories} kcal - {recipe.category}</p>
                            <details className="text-xs mt-2 group">
                                <summary className="cursor-pointer font-medium text-green-600 hover:text-green-800 list-none flex items-center p-1 -ml-1">
                                    <BookOpen size={14} className="mr-1" />
                                    Modo de Preparo
                                    <ChevronDown size={16} className="ml-auto group-open:rotate-180 transition-transform"/>
                                </summary>
                                <p className="mt-2 p-2 bg-white rounded-md text-gray-700 text-sm">{recipe.instructions || 'Instruções não disponíveis.'}</p>
                            </details>
                        </div>
                        <div className="flex items-center justify-center mt-3 gap-4">
                            <button onClick={() => updateMealCount(recipe, -1)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={count === 0}><MinusCircle size={28}/></button>
                            <span className="font-bold text-xl w-8 text-center text-gray-900">{count}</span>
                            <button onClick={() => updateMealCount(recipe, 1)} className="text-green-500 hover:text-green-700"><PlusCircle size={28}/></button>
                        </div>
                    </div>
                )
              })}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-800">Resumo do Plano</h3>
              <p className="text-sm text-gray-600">Total de refeições: {Array.from(selectedMeals.values()).reduce((a, b) => a + b, 0)}</p>
              <p className="text-sm text-gray-600">Total de calorias do plano: <span className="font-bold text-gray-800">{totalCalories}</span> kcal</p>
              <button onClick={() => setCurrentView('shopping')} disabled={selectedMeals.size === 0} className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                <ShoppingCart className="h-5 w-5 mr-2" /> Gerar Lista de Compras
              </button>
            </div>
          </div>
        );

      case 'shopping':
        return (
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Lista de Compras</h2>
              <button onClick={() => setCurrentView('menu')} className="flex items-center text-sm font-medium text-green-600 hover:text-green-800"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Cardápio</button>
            </div>
            <ul className="space-y-2 max-h-[40vh] overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {shoppingList.map(item => ( <li key={item.name} className="flex justify-between text-gray-800"> <span>{item.name}</span> <span className="font-medium">{item.quantity}{item.unit}</span> </li> ))}
               {shoppingList.length === 0 && <p className="text-center text-gray-500 py-4">Sua lista está vazia.</p>}
            </ul>
            <div className="mt-6">
              <a href={formatShoppingListForWhatsApp()} target="_blank" rel="noopener noreferrer" className={`w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 ${shoppingList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Send className="h-5 w-5 mr-2" /> Enviar por WhatsApp
              </a>
            </div>
          </div>
        );

      default: // Welcome Screen
        return (
          <div className="text-center animate-fade-in">
            <Leaf className="mx-auto h-24 w-24 text-green-500" />
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-800">
              Bem-vindo ao <span className="text-green-600">NutrIA</span>
            </h1>
            <p className="mt-2 text-lg text-gray-500">Seu assistente de nutrição inteligente.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setCurrentView('profile')} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-transform">
                    <User className="h-5 w-5 mr-2"/>
                    Começar com Perfil
                </button>
                <button onClick={() => setCurrentView('aiMenu')} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-transform">
                    <Bot className="h-5 w-5 mr-2"/>
                    Criar com IA
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      {renderView()}
    </main>
  );
}
