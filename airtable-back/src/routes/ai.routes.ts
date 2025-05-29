import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { airtableService } from '../lib/airtable.service';
import { GroqService } from '../lib/groq.service';

const router = express.Router();
const groqService = new GroqService();

// Analyser la nutrition d'une recette
router.post('/analyze-nutrition/:recipeId', authenticate, async (req, res, next) => {
  try {
    const recipe = await airtableService.getRecipeById(req.params.recipeId);
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
        const ingredient = await airtableService.getIngredientByName(ingredientName);
        if (!ingredient) {
          throw new Error(`Ingrédient non trouvé: ${ingredientName}`);
        }
        return ingredient;
      })
    );

    // Analyser la nutrition
    const analysis = await groqService.analyzeNutrition(ingredients);

    // Sauvegarder l'analyse dans Airtable
    const savedAnalysis = await airtableService.createNutritionalAnalysis({
      recipeID: req.params.recipeId,
      ...analysis
    });

    res.json(savedAnalysis);
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

    // Récupérer les détails des ingrédients
    const ingredientDetails = await Promise.all(
      ingredients.map(async (ingredientName: string) => {
        const ingredient = await airtableService.getIngredientByName(ingredientName);
        if (!ingredient) {
          throw new Error(`Ingrédient non trouvé: ${ingredientName}`);
        }
        return ingredient;
      })
    );

    // Générer la recette
    const generatedRecipe = await groqService.generateRecipe(ingredientDetails);

    // Adapter les ingrédients pour respecter le type attendu
    const formattedIngredients = generatedRecipe.ingredients.map((ing, idx) => ({
      id: '',
      name: ing.name,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit
    }));

    // Sauvegarder la recette dans Airtable
    const savedRecipe = await airtableService.createRecipe({
      ...generatedRecipe,
      ingredients: formattedIngredients,
      instructions: typeof generatedRecipe.instructions === 'string' ? generatedRecipe.instructions.split('\n') : generatedRecipe.instructions,
      authorID: req.user?.userId || '',
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
    // Appeler le LLM pour générer une réponse
    const response = await groqService.chat(message, conversationHistory);
    // Si la réponse contient une recette, extraire les informations
    if (response.containsRecipe) {
      const recipeData = response.recipeData;
      // Retourner la réponse avec les données de la recette
      return res.json({
        message: response.message,
        recipes: [recipeData],
        containsRecipe: true
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
    const recipe = await airtableService.createRecipe({
      ...recipeData,
      authorID: userId
    });
    res.json({ recipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
});

export default router; 