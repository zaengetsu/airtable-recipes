import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validateRecipe } from '../middleware/validation.middleware';
import { RecipeController } from '../controllers';
import { recipeService } from '../services';

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

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    const userId = req.user.id;

    const recipe = await recipeService.getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    const result = await recipeService.toggleLike(recipeId, userId);
    
    res.json({
      success: true,
      liked: result.liked,
      likesCount: result.likesCount,
      message: result.liked ? 'Recette likée' : 'Like retiré'
    });
  } catch (error) {
    console.error('Erreur route toggle like:', error);
    next(error);
  }
});

router.get('/:id/like-status', authenticate, async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    
    // Vérification de l'authentification
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    const userId = req.user.id;

    const liked = await recipeService.getUserLikeStatus(recipeId, userId);
    
    res.json({ liked });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/likes-count', async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const likesCount = await recipeService.getRecipeLikesCount(recipeId);
    
    res.json({ likesCount });
  } catch (error) {
    next(error);
  }
});

export default router; 