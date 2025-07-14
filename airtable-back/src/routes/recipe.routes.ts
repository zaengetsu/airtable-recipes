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
    console.log('=== CRÉATION DE RECETTE ===');
    console.log('User:', req.user);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const recipeData = {
      ...req.body,
      authorID: "chef" // Utiliser une valeur qui existe dans les options du Multiple Select
    };
    
    console.log('Recipe data to create:', JSON.stringify(recipeData, null, 2));
    
    const recipe = await airtableService.createRecipe(recipeData);
    console.log('Recipe created successfully:', recipe.id);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
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
    if (recipe.authorID !== req.user?.id && req.user?.role !== 'admin') {
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
    if (recipe.authorID !== req.user?.id && req.user?.role !== 'admin') {
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