import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { groqService } from '../lib/groq.service';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Analyser la nutrition d'une recette
router.post('/analyze-nutrition/:recipeId', authenticate, async (req, res, next) => {
  try {
    const recipe = await airtableService.getRecipeById(req.params.recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Recette non trouvée' });
      return;
    }

    // Récupérer les ingrédients de la recette
    const ingredients = await Promise.all(
      recipe.ingredients.map(async (ingredientName) => {
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
      ingredients.map(async (ingredientName) => {
        const ingredient = await airtableService.getIngredientByName(ingredientName);
        if (!ingredient) {
          throw new Error(`Ingrédient non trouvé: ${ingredientName}`);
        }
        return ingredient;
      })
    );

    // Générer la recette
    const generatedRecipe = await groqService.generateRecipe(ingredientDetails);

    // Sauvegarder la recette dans Airtable
    const savedRecipe = await airtableService.createRecipe({
      ...generatedRecipe,
      authorID: req.user?.userId,
      isPublic: true
    });

    res.status(201).json(savedRecipe);
  } catch (error) {
    next(error);
  }
});

export default router; 