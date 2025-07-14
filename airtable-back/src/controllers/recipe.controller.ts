import { Request, Response, NextFunction } from 'express';
import { recipeService } from '../services';

export class RecipeController {
  // Obtenir toutes les recettes
  static async getAllRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await recipeService.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }

  // Obtenir une recette par son ID
  static async getRecipeById(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recette non trouvée' });
      }
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  }

  // Créer une nouvelle recette
  static async createRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('=== CRÉATION DE RECETTE ===');
      console.log('User:', req.user);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const recipeData = {
        ...req.body,
        authorID: "chef" // Utiliser une valeur qui existe dans les options du Multiple Select
      };
      
      console.log('Recipe data to create:', JSON.stringify(recipeData, null, 2));
      
      const recipe = await recipeService.createRecipe(recipeData);
      console.log('Recipe created successfully:', recipe.id);
      res.status(201).json(recipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      next(error);
    }
  }

  // Mettre à jour une recette
  static async updateRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recette non trouvée' });
      }

      // Vérifier si l'utilisateur est l'auteur ou un admin
      if (recipe.authorID !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
      }

      const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.body);
      res.json(updatedRecipe);
    } catch (error) {
      next(error);
    }
  }

  // Supprimer une recette
  static async deleteRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recette non trouvée' });
      }

      // Vérifier si l'utilisateur est l'auteur ou un admin
      if (recipe.authorID !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à supprimer cette recette' });
      }

      await recipeService.deleteRecipe(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Rechercher des recettes
  static async searchRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await recipeService.searchRecipes(req.params.query);
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }

  // Obtenir les recettes par catégorie
  static async getRecipesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await recipeService.getRecipesByCategory(req.params.category);
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }

  // Obtenir les recettes par difficulté
  static async getRecipesByDifficulty(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await recipeService.getRecipesByDifficulty(req.params.difficulty);
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }
} 