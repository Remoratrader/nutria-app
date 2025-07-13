import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Apanha todas as variáveis enviadas pelo front-end
    const { prompt, dailyCalories, objective } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'O prompt do usuário é obrigatório.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave da API do Gemini não foi configurada no servidor.");
    }

    const schema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: { type: "STRING" },
          icon: { type: "STRING" },
          calories: { type: "NUMBER" },
          ingredients: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                quantity: { type: "NUMBER" },
                unit: { type: "STRING" },
              },
              required: ["name", "quantity", "unit"]
            }
          },
          instructions: { type: "STRING" },
        },
        required: ["name", "category", "icon", "calories", "ingredients", "instructions"]
      }
    };

    // --- PROMPT DINÂMICO E CONTEXTUAL ---

    // 1. Persona Base
    let fullPrompt = `Você é uma nutricionista e planejadora de refeições para o aplicativo "NutrIA". Sua principal função é criar planos de refeições práticos, saudáveis e deliciosos em formato JSON.`;

    // 2. Objetivo do Perfil
    if (objective === 'emagrecer') {
      fullPrompt += `\n\nFOCO PRINCIPAL: O objetivo do usuário é EMAGRECER. Priorize receitas com boa densidade nutricional, ricas em fibras e proteínas para aumentar a saciedade, e com calorias controladas.`;
    } else if (objective === 'definir') {
      fullPrompt += `\n\nFOCO PRINCIPAL: O objetivo do usuário é DEFINIÇÃO MUSCULAR. Elabore um plano com alto teor de proteína magra, carboidratos moderados e gorduras saudáveis para apoiar a manutenção muscular durante a perda de gordura.`;
    } else if (objective === 'ganhar massa') {
      fullPrompt += `\n\nFOCO PRINCIPAL: O objetivo do usuário é GANHAR MASSA MUSCULAR. Crie receitas com superávit calórico, ricas em proteínas de alta qualidade e carboidratos complexos para energia e recuperação.`;
    }

    // 3. Contexto do Pedido do Usuário (incluindo calorias)
    // CORREÇÃO: A variável dailyCalories está a ser usada aqui, resolvendo o erro do build.
    fullPrompt += `\n\nSITUAÇÃO E PEDIDO DO USUÁRIO: Analise cuidadosamente o seguinte pedido, considerando uma meta calórica diária de aproximadamente ${dailyCalories || 2000} kcal: "${prompt}". Extraia todas as informações relevantes como duração (ex: '2 semanas'), número de pessoas, restrições (ex: 'sem geladeira', 'alergia a glúten', 'só frutas') e o cenário (ex: 'acampamento', 'viagem de luxo', 'lanches para o trabalho').`;
    
    // 4. Instruções Finais
    fullPrompt += `\n\nSUA TAREFA:
      1.  **Planejamento Lógico:** Com base no pedido, determine a quantidade e o tipo de refeições necessárias.
      2.  **Criação de Receitas:** Crie receitas que se alinhem com o FOCO PRINCIPAL e respeitem TODAS as restrições da SITUAÇÃO. As quantidades de ingredientes em cada receita devem ser para UMA ÚNICA PORÇÃO.
      3.  **Geração do JSON:** Retorne o resultado como um array JSON, seguindo o schema fornecido. As categorias possíveis são: Brasileiro, Fitness, Mediterranea, Asiatico, Vegana, Italiana, Francesa, Árabe, Fast Food, Inovadora, Café da Manhã, Sobremesa Saudável, Mexicana. Seja criativo, mas acima de tudo, seja PRÁTICO e LÓGICO.`;

    const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Erro da API Gemini:", errorBody);
      throw new Error(`Erro na API do Gemini: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedJson = JSON.parse(jsonText);
      return NextResponse.json(parsedJson);
    } else {
      throw new Error("A resposta da IA não continha dados válidos.");
    }

  } catch (error) {
    console.error("Erro no nosso endpoint /api/generate-menu:", error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro interno.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
