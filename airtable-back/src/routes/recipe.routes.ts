import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validateRecipe } from '../middleware/validation.middleware';
import { RecipeController } from '../controllers';

const router = express.Router();

// Obtenir toutes les recettes
router.get(
  '/',
  RecipeController.getAllRecipes
);

// Obtenir une recette par son ID
router.get(
  '/:id',
  RecipeController.getRecipeById
);

// Créer une nouvelle recette
router.post(
  '/',
  authenticate,
  validateRecipe,
  RecipeController.createRecipe
);

// Mettre à jour une recette
router.put(
  '/:id',
  authenticate,
  validateRecipe,
  RecipeController.updateRecipe
);

// Mettre à jour partiellement une recette (pour admin)
router.patch(
  '/:id',
  authenticate,
  isAdmin,
  RecipeController.updateRecipe
);

// Supprimer une recette
router.delete(
  '/:id',
  authenticate,
  RecipeController.deleteRecipe
);

// Rechercher des recettes
router.get(
  '/search/:query',
  RecipeController.searchRecipes
);

// Obtenir les recettes par catégorie
router.get(
  '/category/:category',
  RecipeController.getRecipesByCategory
);

// Obtenir les recettes par difficulté
router.get(
  '/difficulty/:difficulty',
  RecipeController.getRecipesByDifficulty
);

export default router; 