import { Request, Response, NextFunction } from 'express';
import { ingredientService } from '../services';

export class IngredientController {
  // Obtenir tous les ingrédients
  static async getAllIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      
      if (search && typeof search === 'string') {
        const ingredients = await ingredientService.searchIngredients(search);
        res.json(ingredients);
      } else {
        const ingredients = await ingredientService.getAllIngredients();
        res.json(ingredients);
      }
    } catch (error) {
      next(error);
    }
  }

  // Obtenir un ingrédient par son ID
  static async getIngredientById(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await ingredientService.getIngredientById(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingrédient non trouvé' });
      }
      res.json(ingredient);
    } catch (error) {
      next(error);
    }
  }

  // Rechercher des ingrédients
  static async searchIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredients = await ingredientService.searchIngredients(req.params.query);
      res.json(ingredients);
    } catch (error) {
      next(error);
    }
  }
} 