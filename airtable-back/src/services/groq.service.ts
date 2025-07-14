import { Groq } from 'groq-sdk';
import { AirtableIngredient } from '../types/airtable';
import { NutritionalAnalysis, GeneratedRecipe } from '../types';
import { 
  CHAT_SYSTEM_PROMPT,
  NUTRITION_ANALYSIS_PROMPT,
  NUTRITION_SYSTEM_PROMPT,
  NUTRITION_JSON_ANALYSIS_PROMPT,
  NUTRITION_JSON_SYSTEM_PROMPT,
  RECIPE_GENERATION_PROMPT,
  RECIPE_GENERATION_SYSTEM_PROMPT,
  ALLERGY_CONTEXT_PROMPT,
  ALLERGY_CONTEXT_SIMPLE,
  CONVERSATION_PROMPTS
} from './ai';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async chat(message: string, conversationHistory: any[] = [], userAllergies: string[] = []): Promise<any> {
    try {
      // Construire le prompt avec les allergies de manière plus conversationnelle
      let allergyContext = '';
      if (userAllergies.length > 0) {
        allergyContext = ALLERGY_CONTEXT_PROMPT(userAllergies);
      }
      
      // Détecter le type de message et adapter la réponse
      const trimmedMessage = message.trim().toLowerCase();
      const isGreeting = /^(bonjour|hello|salut|hi|hey|coucou|bonsoir|yo|ciao|hola)/i.test(trimmedMessage);
      const isRecipeRequest = /recette|cuisiner|préparer|faire|créer|gâteau|plat|dessert|entrée|manger|cuisine/i.test(trimmedMessage);
      
      let userPrompt;
      let shouldGenerateRecipe = false;
      
      if (isGreeting) {
        userPrompt = CONVERSATION_PROMPTS.greeting(message);
        shouldGenerateRecipe = false;
      } else if (isRecipeRequest) {
        userPrompt = CONVERSATION_PROMPTS.recipeRequest(message, allergyContext);
        shouldGenerateRecipe = true;
      } else {
        userPrompt = CONVERSATION_PROMPTS.generalMessage(message, allergyContext);
        shouldGenerateRecipe = false;
      }
      
      const messagesText = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT + allergyContext },
        ...conversationHistory,
        { role: 'user', content: userPrompt }
      ];
      
      // Premier appel : réponse conversationnelle en markdown
      const completionText = await this.client.chat.completions.create({
        messages: messagesText,
        model: 'llama3-70b-8192',
        temperature: 0.8, // Augmenté pour plus de créativité conversationnelle
        max_tokens: 1500, // Augmenté pour les recettes détaillées
      });
      const userMessage = completionText.choices[0].message.content;

      // Deuxième appel : JSON structuré seulement si c'est une demande de recette
      let recipeData = null;
      let canCreateRecipe = false;
      
      if (shouldGenerateRecipe && userMessage) {
                // Extraire les informations de la recette depuis la réponse markdown
        const recipeNameMatch = userMessage.match(/## 🎯 \*\*(.*?)\*\*/);
        const ingredientsMatch = userMessage.match(/🥘 \*\*Ingrédients :\*\*\n([\s\S]*?)(?=\n\n|📝)/);
        const instructionsMatch = userMessage.match(/📝 \*\*Instructions :\*\*\n([\s\S]*?)(?=\n\n|💡|🔄|$)/);
        
        if (recipeNameMatch && ingredientsMatch && instructionsMatch) {
          const name = recipeNameMatch[1];
          const ingredientsText = ingredientsMatch[1];
          const instructionsText = instructionsMatch[1];
          
          // Parser les ingrédients depuis le tableau
          const ingredients = ingredientsText
            .split('\n')
            .filter(line => line.includes('|') && !line.includes('---'))
            .map(line => {
              const columns = line.split('|').map(col => col.trim()).filter(Boolean);
              if (columns.length >= 3) {
                return {
                  quantity: columns[0],
                  unit: columns[1],
                  name: columns[2]
                };
              }
              return null;
            })
            .filter(Boolean);
          
          // Parser les instructions
          const instructions = instructionsText
            .split('\n')
            .filter(line => /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean);
          
          if (ingredients.length > 0 && instructions.length > 0) {
            recipeData = {
              name,
              description: "Recette générée par l'assistant",
              ingredients,
              instructions,
              servings: 4,
              preparationTime: 15,
              cookingTime: 20,
              difficulty: "Facile",
              category: "Plat principal"
            };
            canCreateRecipe = true;
          }
        }
      }

      return {
        message: userMessage,
        containsRecipe: !!recipeData,
        canCreateRecipe,
        recipeData
      };
    } catch (error) {
      console.error('Error in Groq chat:', error);
      throw error;
    }
  }

  async analyzeNutrition(ingredients: AirtableIngredient[]): Promise<NutritionalAnalysis> {
    const prompt = NUTRITION_JSON_ANALYSIS_PROMPT(JSON.stringify(ingredients, null, 2));

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: NUTRITION_JSON_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Réponse vide de l\'API');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur lors de l\'analyse nutritionnelle:', error);
      throw new Error('Erreur lors de l\'analyse nutritionnelle');
    }
  }

  async analyzeNutritionText(recipeName: string, ingredients: string): Promise<string> {
    const prompt = NUTRITION_ANALYSIS_PROMPT(recipeName, ingredients);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: NUTRITION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Réponse vide de l\'API');
      }

      return content;
    } catch (error) {
      console.error('Erreur lors de l\'analyse nutritionnelle:', error);
      throw new Error('Erreur lors de l\'analyse nutritionnelle');
    }
  }

  async generateRecipe(ingredients: AirtableIngredient[], userAllergies: string[] = []): Promise<GeneratedRecipe> {
    let allergyContext = '';
    if (userAllergies.length > 0) {
      allergyContext = ALLERGY_CONTEXT_SIMPLE(userAllergies);
    }

    const prompt = RECIPE_GENERATION_PROMPT(JSON.stringify(ingredients, null, 2), allergyContext);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: RECIPE_GENERATION_SYSTEM_PROMPT
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
} 