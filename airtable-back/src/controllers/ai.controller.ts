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
      const { ingredients } = req.body;
      
      const analysis = await groqService.analyzeNutrition(ingredients);
      
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }
} 