import { Recipe } from '@/types/recipe';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  allergens: string[];
  unit: string;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';

export const groqService = {
  async generateRecipe(query: string, availableIngredients: Ingredient[]): Promise<Omit<Recipe, 'id'>> {
    try {
      const prompt = `En tant que chef cuisinier professionnel, créez une recette qui correspond à la demande suivante : "${query}".
Utilisez uniquement les ingrédients disponibles dans la liste suivante :
${JSON.stringify(availableIngredients, null, 2)}

La recette doit être :
1. Réalisable avec les ingrédients disponibles
2. Équilibrée nutritionnellement
3. Adaptée au niveau de difficulté demandé
4. Claire et précise dans les instructions

Répondez au format JSON suivant :
{
  "name": "Nom de la recette",
  "description": "Description courte et appétissante",
  "ingredients": [
    {
      "id": "ID de l'ingrédient",
      "name": "Nom de l'ingrédient",
      "quantity": quantité,
      "unit": "unité"
    }
  ],
  "instructions": [
    "Étape 1",
    "Étape 2",
    ...
  ],
  "servings": nombre de portions,
  "preparationTime": temps en minutes,
  "cookingTime": temps en minutes,
  "difficulty": "Facile" | "Moyen" | "Difficile",
  "category": "Catégorie de la recette",
  "nutritionalAnalysis": {
    "calories": nombre total,
    "proteins": grammes,
    "carbs": grammes,
    "fats": grammes,
    "vitamins": ["liste des vitamines"],
    "minerals": ["liste des minéraux"]
  }
}`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'Vous êtes un chef cuisinier professionnel qui crée des recettes détaillées et équilibrées.'
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
      const recipeJson = JSON.parse(data.choices[0].message.content);

      return {
        ...recipeJson,
        isPublic: true,
        authorID: '', // Sera rempli par l'API
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la recette:', error);
      throw new Error('Erreur lors de la génération de la recette');
    }
  }
}; 