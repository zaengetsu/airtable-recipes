import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRecipe } from '../middleware/validation.middleware';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Obtenir toutes les recettes
router.get('/', async (req, res, next) => {
  try {
    const recipes = await airtableService.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Obtenir une recette par son ID
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await airtableService.getRecipeById(req.params.id);
    if (!recipe) {
      res.status(404).json({ message: 'Recette non trouvée' });
      return;
    }
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Créer une nouvelle recette
router.post('/', authenticate, validateRecipe, async (req, res, next) => {
  try {
    const recipe = await airtableService.createRecipe({
      ...req.body,
      authorID: req.user?.userId
    });
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour une recette
router.put('/:id', authenticate, validateRecipe, async (req, res, next) => {
  try {
    const recipe = await airtableService.getRecipeById(req.params.id);
    if (!recipe) {
      res.status(404).json({ message: 'Recette non trouvée' });
      return;
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (recipe.authorID !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
      return;
    }

    const updatedRecipe = await airtableService.updateRecipe(req.params.id, req.body);
    res.json(updatedRecipe);
  } catch (error) {
    next(error);
  }
});

// Supprimer une recette
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const recipe = await airtableService.getRecipeById(req.params.id);
    if (!recipe) {
      res.status(404).json({ message: 'Recette non trouvée' });
      return;
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (recipe.authorID !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Non autorisé à supprimer cette recette' });
      return;
    }

    await airtableService.deleteRecipe(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Rechercher des recettes
router.get('/search/:query', async (req, res, next) => {
  try {
    const recipes = await airtableService.searchRecipes(req.params.query);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Obtenir les recettes par catégorie
router.get('/category/:category', async (req, res, next) => {
  try {
    const recipes = await airtableService.getRecipesByCategory(req.params.category);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Obtenir les recettes par difficulté
router.get('/difficulty/:difficulty', async (req, res, next) => {
  try {
    const recipes = await airtableService.getRecipesByDifficulty(req.params.difficulty);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

export default router; 