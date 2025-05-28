import { AirtableIngredient } from '../types/airtable.types';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface NutritionalAnalysis {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  vitamins: string[];
  minerals: string[];
  allergens: string[];
}

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string;
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
}

export const groqService = {
  async analyzeNutrition(ingredients: AirtableIngredient[]): Promise<NutritionalAnalysis> {
    const prompt = `Analysez les valeurs nutritionnelles suivantes et fournissez une analyse détaillée au format JSON:
    ${JSON.stringify(ingredients, null, 2)}
    
    Répondez uniquement avec un objet JSON contenant:
    {
      "totalCalories": number,
      "totalProteins": number,
      "totalCarbs": number,
      "totalFats": number,
      "vitamins": string[],
      "minerals": string[],
      "allergens": string[]
    }`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en nutrition qui analyse les ingrédients et fournit des informations nutritionnelles précises.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'analyse nutritionnelle');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  },

  async generateRecipe(ingredients: AirtableIngredient[]): Promise<GeneratedRecipe> {
    const prompt = `En tant que chef cuisinier professionnel, créez une recette détaillée et savoureuse en utilisant les ingrédients suivants:
    ${JSON.stringify(ingredients, null, 2)}

    Instructions spécifiques:
    1. Créez une recette qui met en valeur les ingrédients fournis tout en les complétant avec des ingrédients de base courants (sel, poivre, huile, etc.)
    2. Assurez-vous que les quantités sont réalistes et proportionnelles
    3. Les instructions doivent être claires, précises et dans l'ordre chronologique
    4. La difficulté doit être adaptée à la complexité réelle de la recette
    5. La catégorie doit être pertinente (ex: "Plat principal", "Entrée", "Dessert", etc.)
    6. Le temps de préparation et de cuisson doivent être réalistes
    7. La description doit être attrayante et donner envie de cuisiner

    Répondez UNIQUEMENT avec un objet JSON contenant:
    {
      "name": string, // Nom créatif et attrayant de la recette
      "description": string, // Description détaillée et appétissante
      "ingredients": Array<{
        name: string, // Nom de l'ingrédient
        quantity: string, // Quantité précise
        unit: string // Unité de mesure (g, ml, cuillère à soupe, etc.)
      }>,
      "instructions": string, // Instructions détaillées, une par ligne
      "servings": number, // Nombre de portions
      "preparationTime": number, // Temps de préparation en minutes
      "cookingTime": number, // Temps de cuisson en minutes
      "difficulty": "Facile" | "Moyen" | "Difficile", // Niveau de difficulté
      "category": string // Catégorie de la recette
    }`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un chef cuisinier professionnel avec une expertise en gastronomie française et internationale. Vous créez des recettes détaillées, savoureuses et accessibles, en veillant à ce que chaque étape soit claire et précise. Vous avez une connaissance approfondie des techniques culinaires et des associations de saveurs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la recette');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}; 