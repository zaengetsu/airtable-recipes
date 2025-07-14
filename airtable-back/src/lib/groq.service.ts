import { Groq } from 'groq-sdk';
import { AirtableIngredient } from '../types/airtable.types';

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

export class GroqService {
  private client: Groq;
  private systemPrompt = `Tu es un assistant culinaire expert et bienveillant. Ton rôle est d'aider les utilisateurs à créer des recettes délicieuses tout en veillant à leur sécurité alimentaire.

TON RÔLE :
- Répondre de manière naturelle et conversationnelle à tous types de messages
- Proposer des recettes quand on te le demande
- Aider avec des conseils culinaires
- Être un compagnon de cuisine amical et encourageant

QUAND TU DÉTECTES DES ALLERGÈNES :
- Sois empathique et prévenant : "Je vois que cette recette contient [allergène] auquel vous êtes allergique. Laissez-moi vous proposer une alternative délicieuse sans cet ingrédient !"
- Propose spontanément des alternatives : "À la place, je peux vous suggérer [alternative] qui donnera un résultat similaire"
- Explique pourquoi l'alternative fonctionne : "Cette substitution garde la même texture/saveur car..."
- Sois rassurant : "Ne vous inquiétez pas, il existe plein d'alternatives délicieuses !"

TON TON :
- Amical et conversationnel, comme un ami qui cuisine avec vous
- Utilise "je" et "vous" pour créer une connexion personnelle
- Sois encourageant et positif
- Explique vos choix de manière pédagogique
- Ajoute des touches d'humour et de personnalité
- Utilise des expressions culinaires françaises
- Sois créatif dans tes descriptions de recettes
- Réponds naturellement aux salutations et questions générales

Quand tu proposes une recette, structure-la clairement avec :
- Un titre
- Une liste d'ingrédients avec quantités
- Des instructions étape par étape
- Des informations nutritionnelles si possible

Format de réponse pour une recette :
{
  "containsRecipe": true,
  "canCreateRecipe": true, // ce champ doit être à true si la recette est complète et peut être créée
  "recipeData": {
    "name": "Titre de la recette",
    "description": "Description appétissante",
    "ingredients": [
      { "name": "ingrédient 1", "quantity": "100", "unit": "g" },
      { "name": "ingrédient 2", "quantity": "2", "unit": "pièce" }
    ],
    "instructions": ["étape 1", "étape 2"],
    "servings": 2,
    "preparationTime": 10,
    "cookingTime": 20,
    "difficulty": "Facile",
    "category": "Plat principal"
  }
}

Si tu n'as pas assez d'informations, propose la recette la plus plausible possible sans insister pour obtenir plus de détails.`;

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
        allergyContext = `\n\nINFORMATIONS IMPORTANTES SUR LES ALLERGIES :
        L'utilisateur est allergique aux éléments suivants : ${userAllergies.join(', ')}.
        
        QUAND TU PROPOSES UNE RECETTE :
        - Vérifie d'abord si elle contient des allergènes
        - Si oui, explique gentiment le problème et propose immédiatement une alternative
        - Sois rassurant et créatif dans tes suggestions
        - Explique pourquoi ton alternative fonctionne bien
        - Utilise un ton amical et prévenant
        
        Exemples de réponses :
        "Oh, je vois que cette recette contient des noix ! Comme vous y êtes allergique, laissez-moi vous proposer une version avec des graines de tournesol à la place. Elles apportent le même croquant et sont délicieuses !"
        
        "Cette recette utilise du lait, mais je peux facilement l'adapter avec du lait d'amande ou d'avoine. Le résultat sera tout aussi crémeux et délicieux !"`;
      }
      
      // Détecter le type de message et adapter la réponse
      const trimmedMessage = message.trim().toLowerCase();
      const isGreeting = /^(bonjour|hello|salut|hi|hey|coucou|bonsoir|yo|ciao|hola)/i.test(trimmedMessage);
      const isRecipeRequest = /recette|cuisiner|préparer|faire|créer|gâteau|plat|dessert|entrée|manger|cuisine/i.test(trimmedMessage);
      
      let userPrompt;
      let shouldGenerateRecipe = false;
      
      if (isGreeting) {
        userPrompt = `L'utilisateur a dit "${message}". 

Réponds de manière naturelle et amicale à cette salutation. Présente-toi comme un assistant culinaire et propose tes services de manière engageante. N'utilise PAS le format de recette JSON, juste une réponse conversationnelle.`;
        shouldGenerateRecipe = false;
      } else if (isRecipeRequest) {
        userPrompt = `Donne-moi une recette de ${message}.${allergyContext}

FORMAT DE RÉPONSE POUR UNE RECETTE :
- Utilise du markdown avec des emojis et une mise en forme attrayante
- Ajoute des conseils culinaires et des astuces
- Inclus des variantes ou suggestions d'amélioration
- Sois créatif dans la description et les instructions
- Ajoute des notes sur les temps de repos, la conservation, etc.

Exemple de format :
## 🎯 **Nom de la recette**
*Description appétissante*

🥘 **Ingrédients :**

| Quantité | Unité | Ingrédient |
|----------|-------|------------|
| 200 | g | Farine |
| 2 | unités | Œufs |
| 150 | ml | Lait |

📝 **Instructions :**
1. Étape détaillée
...

💡 **Conseils et astuces :**
- Conseil 1
- Conseil 2

🔄 **Variantes :**
- Variante 1
- Variante 2

Si tu détectes des allergènes, explique gentiment et propose des alternatives.`;
        shouldGenerateRecipe = true;
      } else {
        userPrompt = `L'utilisateur a dit : "${message}". 

Réponds de manière naturelle et conversationnelle. Si c'est une demande de recette, propose une recette. Si c'est une question générale sur la cuisine, aide-le. Si c'est juste une conversation, sois amical et engageant.${allergyContext}`;
        shouldGenerateRecipe = false;
      }
      
      const messagesText = [
        { role: 'system', content: this.systemPrompt + allergyContext },
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

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3-70b-8192',
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
    const prompt = `Analysez les valeurs nutritionnelles de cette recette et fournissez une analyse détaillée au format markdown :

**Recette :** ${recipeName}
**Ingrédients :** ${ingredients}

Fournissez une analyse complète et détaillée avec :

## 📊 **Valeurs nutritionnelles estimées**
- Calories totales
- Protéines (g)
- Glucides (g)
- Lipides (g)
- Fibres (g)

## 🥬 **Vitamines et minéraux présents**
- Liste des vitamines principales
- Minéraux importants

## ⚠️ **Allergènes potentiels**
- Identification des allergènes courants

## 💡 **Conseils nutritionnels**
- Points positifs de la recette
- Suggestions d'amélioration
- Pour qui cette recette convient

Format de réponse en markdown avec emojis, titres en gras, et mise en forme claire et professionnelle.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en nutrition qui analyse les ingrédients et fournit des informations nutritionnelles précises et détaillées.'
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
      allergyContext = `\n\nATTENTION ALLERGIES : L'utilisateur est allergique aux éléments suivants : ${userAllergies.join(', ')}. 
      Si la recette contient des allergènes, proposez automatiquement des alternatives appropriées dans les ingrédients. 
      Par exemple, remplacez le lait par du lait d'amande, les noix par des graines, etc.`;
    }

    const prompt = `En tant que chef cuisinier professionnel et bienveillant, créez une recette détaillée et savoureuse en utilisant les ingrédients suivants:
    ${JSON.stringify(ingredients, null, 2)}${allergyContext}

    Instructions spécifiques:
    1. Créez une recette qui met en valeur les ingrédients fournis tout en les complétant avec des ingrédients de base courants (sel, poivre, huile, etc.)
    2. Assurez-vous que les quantités sont réalistes et proportionnelles
    3. Les instructions doivent être claires, précises et dans l'ordre chronologique
    4. La difficulté doit être adaptée à la complexité réelle de la recette
    5. La catégorie doit être pertinente (ex: "Plat principal", "Entrée", "Dessert", etc.)
    6. Le temps de préparation et de cuisson doivent être réalistes
    7. La description doit être attrayante et donner envie de cuisiner
    8. Si des allergènes sont détectés, proposez automatiquement des alternatives appropriées

    Répondez UNIQUEMENT avec un objet JSON contenant:
    {
      "name": string, // Nom créatif et attrayant de la recette
      "description": string, // Description détaillée et appétissante
      "ingredients": Array<{
        name: string, // Nom de l'ingrédient (avec alternatives si allergènes)
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
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
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
} 