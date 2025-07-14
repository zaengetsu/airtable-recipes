import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { recipeService } from '../services/recipe.service';
import { ingredientService } from '../services/ingredient.service';
import { userService } from '../services/user.service';
import { nutritionalAnalysisService } from '../services/nutritionalAnalysis.service';
import { GroqService } from '../lib/groq.service';

const router = express.Router();
const groqService = new GroqService();

// Fonction utilitaire pour formater une recette avec du markdown esthétique
function formatRecipeWithMarkdown(recipeData: any): string {
  const difficultyEmoji = {
    'Facile': '🟢',
    'Moyen': '🟡',
    'Difficile': '🔴'
  };

  const categoryEmoji = {
    'Plat principal': '🍽️',
    'Entrée': '🥗',
    'Dessert': '🍰',
    'Petit déjeuner': '🥐',
    'Goûter': '🍪',
    'Apéritif': '🥂',
    'Soupe': '🍲',
    'Salade': '🥗',
    'Pâtes': '🍝',
    'Pizza': '🍕',
    'Burger': '🍔',
    'Sushi': '🍣',
    'Tarte': '🥧',
    'Gâteau': '🎂'
  };

  const timeEmoji = '⏱️';
  const servingsEmoji = '👥';
  const ingredientsEmoji = '🥘';
  const instructionsEmoji = '📝';

  const title = `## 🎯 **${recipeData.name}**`;
  const description = `*${recipeData.description}*`;

  const ingredients = recipeData.ingredients.map((ing: any) =>
    `• **${ing.quantity} ${ing.unit}** ${ing.name}`
  ).join('\n');

  const instructions = recipeData.instructions.map((step: string, i: number) =>
    `${i + 1}. ${step}`
  ).join('\n');

  const info = [
    `${servingsEmoji} **Portions :** ${recipeData.servings}`,
    `${timeEmoji} **Préparation :** ${recipeData.preparationTime} min`,
    `${timeEmoji} **Cuisson :** ${recipeData.cookingTime} min`,
    `${difficultyEmoji[recipeData.difficulty as keyof typeof difficultyEmoji] || '📊'} **Difficulté :** ${recipeData.difficulty}`,
    `${categoryEmoji[recipeData.category as keyof typeof categoryEmoji] || '🏷️'} **Catégorie :** ${recipeData.category}`
  ].join(' | ');

  return `${title}\n\n${description}\n\n${ingredientsEmoji} **Ingrédients :**\n${ingredients}\n\n${instructionsEmoji} **Instructions :**\n${instructions}\n\n---\n${info}`;
}

// Analyser la nutrition d'une recette
router.post('/analyze-nutrition/:recipeId', authenticate, async (req, res, next) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Recette non trouvée' });
      return;
    }

    // Récupérer les ingrédients de la recette
    const ingredientNames = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((ing: any) => typeof ing === 'string' ? ing : ing.name)
      : [];
    const ingredients = await Promise.all(
      ingredientNames.map(async (ingredientName: string) => {
        const ingredient = await ingredientService.getIngredientByName(ingredientName);
        if (!ingredient) {
          throw new Error(`Ingrédient non trouvé: ${ingredientName}`);
        }
        return ingredient;
      })
    );

    // Analyser la nutrition
    const analysis = await groqService.analyzeNutrition(ingredients);

    // Formater l'analyse pour l'affichage
    const formattedAnalysis = `
## 📊 **Analyse Nutritionnelle**

**Valeurs nutritionnelles par portion :**
• **Calories :** ${analysis.totalCalories} kcal
• **Protéines :** ${analysis.totalProteins} g
• **Glucides :** ${analysis.totalCarbs} g
• **Lipides :** ${analysis.totalFats} g

**Vitamines présentes :**
${analysis.vitamins.map(vitamin => `• ${vitamin}`).join('\n')}

**Minéraux présents :**
${analysis.minerals.map(mineral => `• ${mineral}`).join('\n')}

**Allergènes détectés :**
${analysis.allergens.length > 0 ? analysis.allergens.map(allergen => `• ${allergen}`).join('\n') : 'Aucun allergène détecté'}
    `.trim();

    // Sauvegarder l'analyse dans Airtable
    const savedAnalysis = await nutritionalAnalysisService.createNutritionalAnalysis({
      recipeID: req.params.recipeId,
      ...analysis
    });

    res.json({
      analysis: formattedAnalysis,
      data: savedAnalysis
    });
  } catch (error) {
    next(error);
  }
});

// Générer une recette à partir d'ingrédients
router.post('/generate-recipe', authenticate, async (req, res, next) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ message: 'La liste des ingrédients est requise' });
      return;
    }

    // Récupérer les allergies de l'utilisateur
    const userId = req.user?.id || '';
    const user = await userService.getUserById(userId);
    const userAllergies = user?.allergies || [];

    // Récupérer les détails des ingrédients
    const ingredientDetails = await Promise.all(
      ingredients.map(async (ingredientName: string) => {
        const ingredient = await ingredientService.getIngredientByName(ingredientName);
        if (!ingredient) {
          throw new Error(`Ingrédient non trouvé: ${ingredientName}`);
        }
        return ingredient;
      })
    );

    // Générer la recette en tenant compte des allergies
    const generatedRecipe = await groqService.generateRecipe(ingredientDetails, userAllergies);

    // Adapter les ingrédients pour respecter le type attendu
    const formattedIngredients = generatedRecipe.ingredients.map((ing, idx) => ({
      id: '',
      name: ing.name,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit
    }));

    // Sauvegarder la recette dans Airtable
    const savedRecipe = await recipeService.createRecipe({
      ...generatedRecipe,
      ingredients: formattedIngredients,
      instructions: typeof generatedRecipe.instructions === 'string' ? generatedRecipe.instructions.split('\n') : generatedRecipe.instructions,
      authorID: "chef",
      isPublic: true
    });

    res.status(201).json(savedRecipe);
  } catch (error) {
    next(error);
  }
});

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?.id || '';

    // Récupérer les allergies de l'utilisateur
    const user = await userService.getUserById(userId);
    const userAllergies = user?.allergies || [];

    // Appeler le LLM pour générer une réponse avec les allergies
    const response = await groqService.chat(message, conversationHistory, userAllergies);
    // Si la réponse contient une recette, extraire les informations
    if (response.containsRecipe) {
      const recipeData = response.recipeData;
      // Formater la recette pour l'utilisateur
      const formattedMessage = formatRecipeWithMarkdown(recipeData);
      // Retourner la réponse formatée + les données pour le bouton
      return res.json({
        message: formattedMessage,
        containsRecipe: true,
        canCreateRecipe: response.canCreateRecipe || false,
        recipeData: recipeData
      });
    }
    // Sinon, retourner juste la réponse du chat
    return res.json({
      message: response.message,
      containsRecipe: false
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
});

router.post('/create-recipe', authenticate, async (req, res) => {
  try {
    const { recipeData } = req.body;
    const userId = req.user?.id || '';
    // Créer la recette dans Airtable
    const recipe = await recipeService.createRecipe({
      ...recipeData,
      authorID: "chef"
    });
    res.json({ recipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
});

// Analyser la nutrition d'une recette (nouvelle route simplifiée)
router.post('/analyze-nutrition', authenticate, async (req, res) => {
  try {
    const { recipeName, ingredients } = req.body;
    
    if (!recipeName || !ingredients) {
      res.status(400).json({ error: 'Nom de recette et ingrédients requis' });
      return;
    }

    // Utiliser le service Groq pour analyser la nutrition
    const analysis = await groqService.analyzeNutritionText(recipeName, ingredients);
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error in nutrition analysis:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse nutritionnelle' });
  }
});

export default router; 