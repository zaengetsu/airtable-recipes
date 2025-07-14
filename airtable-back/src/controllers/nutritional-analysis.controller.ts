import { Request, Response, NextFunction } from 'express';
import { nutritionalAnalysisService } from '../services';

export class NutritionalAnalysisController {
  // Obtenir l'analyse nutritionnelle d'une recette
  static async getNutritionalAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await nutritionalAnalysisService.getNutritionalAnalysis(req.params.recipeId);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }

  // Créer une analyse nutritionnelle
  static async createNutritionalAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await nutritionalAnalysisService.createNutritionalAnalysis(req.body);
      res.status(201).json(analysis);
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour une analyse nutritionnelle
  static async updateNutritionalAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await nutritionalAnalysisService.updateNutritionalAnalysis(req.params.analysisId, req.body);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }

  // Supprimer une analyse nutritionnelle
  static async deleteNutritionalAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      await nutritionalAnalysisService.deleteNutritionalAnalysis(req.params.analysisId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 