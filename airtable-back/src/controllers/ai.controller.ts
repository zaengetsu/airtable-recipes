import { Request, Response, NextFunction } from 'express';
import { GroqService } from '../lib/groq.service';

const groqService = new GroqService();

export class AIController {
  // Chat avec l'IA
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationHistory = [], userAllergies = [] } = req.body;
      
      const response = await groqService.chat(message, conversationHistory, userAllergies);
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Analyser la valeur nutritionnelle
  static async analyzeNutrition(req: Request, res: Response, next: NextFunction) {
    try {
      const { ingredients, recipeName } = req.body;
      
      // Convertir les ingrédients en chaîne de caractères pour l'analyse textuelle
      const ingredientsText = ingredients.map((ing: any) => 
        `${ing.name || ing.toString()}${ing.quantity ? ` (${ing.quantity}${ing.unit || 'g'})` : ''}`
      ).join(', ');
      
      const analysis = await groqService.analyzeNutritionText(recipeName || 'Recette', ingredientsText);
      
      res.json({ analysis });
    } catch (error) {
      console.error('Erreur dans analyzeNutrition:', error);
      next(error);
    }
  }
} 