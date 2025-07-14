import { Request, Response, NextFunction } from 'express';
import { allergyService } from '../services';

export class AllergyController {
  // Obtenir toutes les allergies
  static async getAllAllergies(req: Request, res: Response, next: NextFunction) {
    try {
      const allergies = await allergyService.getAllAllergies();
      res.json(allergies);
    } catch (error) {
      next(error);
    }
  }

  // Obtenir une allergie par son ID
  static async getAllergyById(req: Request, res: Response, next: NextFunction) {
    try {
      const allergy = await allergyService.getAllergyById(req.params.id);
      if (!allergy) {
        return res.status(404).json({ message: 'Allergie non trouvée' });
      }
      res.json(allergy);
    } catch (error) {
      next(error);
    }
  }
} 