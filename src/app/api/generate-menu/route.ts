import { NextResponse } from 'next/server';

// Esta função será o nosso endpoint de API seguro.
// Ela roda apenas no servidor, protegendo nossos segredos.
export async function POST(req: Request) {
  try {
    // 1. Recebe os dados enviados pelo front-end (apenas o que é seguro compartilhar)
    const { prompt, dailyCalories } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'O prompt do usuário é obrigatório.' }, { status: 400 });
    }

    // 2. Pega a chave da API do Gemini das variáveis de ambiente do servidor (SECRETO)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave da API do Gemini não foi configurada no servidor.");
    }

    // 3. Define o schema (a estrutura JSON que esperamos da IA)
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

    // 4. Monta o prompt completo, combinando nossa lógica secreta com o pedido do usuário (NOSSO DIFERENCIAL)
    const fullPrompt = `Você é um chef nutricionista para o app "NutrIA". Um usuário precisa de um cardápio com uma necessidade calórica diária de aproximadamente ${dailyCalories || 2000} kcal. O pedido do usuário é: "${prompt}". Gere uma lista de receitas em JSON que atendam a esse pedido. Atribua um emoji apropriado no campo 'icon'. Categorias podem ser: Brasileiro, Fitness, Mediterranea, Asiatico, Vegana, Italiana, Francesa, Árabe, Fast Food, Inovadora.`;

    const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 5. Faz a chamada para a API do Gemini a partir do servidor
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

    // 6. Envia a resposta limpa (apenas a lista de receitas) de volta para o front-end
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedJson = JSON.parse(jsonText);
      return NextResponse.json(parsedJson);
    } else {
      throw new Error("A resposta da IA não continha dados válidos.");
    }

  } catch (error) { // CORREÇÃO APLICADA AQUI
    console.error("Erro no nosso endpoint /api/generate-menu:", error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro interno.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
